# ════════════════════════════════════════════════════════════════════════════
# SUOP ERP v1.0 — Backend Dockerfile (Production)
# ════════════════════════════════════════════════════════════════════════════
# Multi-stage build:
#   Stage 1 (builder): Install deps, generate Prisma client, compile TypeScript
#   Stage 2 (runtime): Slim runtime image with only production artifacts
#
# Per RC1 Fix Pack 1 §5: Production-grade container with:
#   - Multi-stage build for small image size
#   - Non-root user for security
#   - Health check baked in
#   - Build metadata injected via build args
#   - Dumb-init for proper signal handling

# ─── Stage 1: Builder ──────────────────────────────────────────────────────
FROM oven/bun:1.1 AS builder

WORKDIR /app

# Install OS dependencies needed for native modules (argon2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy lockfile and package.json first for better layer caching
COPY apps/backend/package.json apps/backend/bun.lock* ./
COPY prisma ./prisma

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY apps/backend ./

# Build arguments for metadata (injected by CI)
ARG APP_VERSION=1.0.0-rc1
ARG GIT_COMMIT=unknown
ARG BUILD_DATE
ARG BUILD_HOST=docker

ENV APP_VERSION=${APP_VERSION}
ENV GIT_COMMIT=${GIT_COMMIT}
ENV BUILD_DATE=${BUILD_DATE}
ENV BUILD_HOST=${BUILD_HOST}

# Generate Prisma client
RUN DATABASE_URL="postgresql://placeholder" bunx prisma generate --schema=prisma/schema.prisma

# Compile TypeScript to dist/
RUN bun build src/main.ts --target=bun --outdir dist

# ─── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM oven/bun:1.1-slim AS runtime

# Install runtime OS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tini \
    libssl3 \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system --gid 1001 suop \
    && adduser --system --uid 1001 --gid 1001 suop

WORKDIR /app

# Copy package files and install production dependencies only
COPY --from=builder /app/package.json /app/bun.lock* ./
COPY --from=builder /app/prisma ./prisma
RUN bun install --production --frozen-lockfile || bun install --production

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

# Create uploads directory with correct ownership
RUN mkdir -p uploads db && chown -R suop:suop /app

# Set build metadata
ARG APP_VERSION=1.0.0-rc1
ARG GIT_COMMIT=unknown
ARG BUILD_DATE
ARG BUILD_HOST=docker
ENV APP_VERSION=${APP_VERSION}
ENV GIT_COMMIT=${GIT_COMMIT}
ENV BUILD_DATE=${BUILD_DATE}
ENV BUILD_HOST=${BUILD_HOST}
ENV NODE_ENV=production

# Switch to non-root user
USER suop

# Expose port
EXPOSE 3030

# Health check (uses root-level /health endpoint added in RC1 Fix Pack 1)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3030/health || exit 1

# Use tini for proper signal handling and zombie reaping
ENTRYPOINT ["/usr/bin/tini", "--"]

# Start the application
CMD ["bun", "dist/main.js"]
