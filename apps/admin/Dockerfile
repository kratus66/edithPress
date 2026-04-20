# ============================================================
# EdithPress — Admin Panel (Next.js standalone) — Multi-stage Dockerfile
# Build context: monorepo root
#   docker build -f apps/admin/Dockerfile -t edithpress-admin .
# Requiere: output: 'standalone' en apps/admin/next.config.js
# ============================================================

# ────────────────────────────────────────────────────────────
# Stage 1: builder — instala deps + compila Next.js
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/admin/package.json ./apps/admin/

RUN pnpm install --frozen-lockfile

COPY apps/admin/ ./apps/admin/

RUN cd apps/admin && pnpm build

# ────────────────────────────────────────────────────────────
# Stage 2: runner — imagen mínima con el output standalone
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# El output standalone incluye solo lo necesario para correr la app
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3010/ || exit 1

CMD ["node", "apps/admin/server.js"]
