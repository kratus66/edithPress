# ============================================================
# EdithPress — Public Site Renderer (Next.js standalone) — Multi-stage Dockerfile
# Build context: monorepo root
#   docker build -f apps/renderer/Dockerfile -t edithpress-renderer .
# Requiere: output: 'standalone' en apps/renderer/next.config.js
# ============================================================

# ────────────────────────────────────────────────────────────
# Stage 1: builder — instala deps + compila Next.js
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/renderer/package.json ./apps/renderer/

RUN pnpm install --frozen-lockfile

COPY apps/renderer/ ./apps/renderer/

RUN cd apps/renderer && pnpm build

# ────────────────────────────────────────────────────────────
# Stage 2: runner — imagen mínima con el output standalone
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/renderer/.next/standalone ./
COPY --from=builder /app/apps/renderer/.next/static ./apps/renderer/.next/static
COPY --from=builder /app/apps/renderer/public ./apps/renderer/public

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3003/ || exit 1

CMD ["node", "apps/renderer/server.js"]
