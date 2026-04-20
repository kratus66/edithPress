# ============================================================
# EdithPress — Visual Builder (Next.js standalone) — Multi-stage Dockerfile
# Build context: monorepo root
#   docker build -f apps/builder/Dockerfile -t edithpress-builder .
# Requiere: output: 'standalone' en apps/builder/next.config.js
# ============================================================

# ────────────────────────────────────────────────────────────
# Stage 1: builder — instala deps + compila Next.js
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/builder/package.json ./apps/builder/

RUN pnpm install --frozen-lockfile

COPY apps/builder/ ./apps/builder/

RUN cd apps/builder && pnpm build

# ────────────────────────────────────────────────────────────
# Stage 2: runner — imagen mínima con el output standalone
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/builder/.next/standalone ./
COPY --from=builder /app/apps/builder/.next/static ./apps/builder/.next/static
COPY --from=builder /app/apps/builder/public ./apps/builder/public

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3002/ || exit 1

CMD ["node", "apps/builder/server.js"]
