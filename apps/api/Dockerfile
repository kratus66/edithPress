# ============================================================
# EdithPress — API (NestJS) — Multi-stage Dockerfile
# Build context: monorepo root
#   docker build -f apps/api/Dockerfile -t edithpress-api .
# ============================================================

# ────────────────────────────────────────────────────────────
# Stage 1: builder — instala deps + compila
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Habilita pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar manifiestos primero para aprovechar la caché de capas de Docker
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY apps/api/ ./apps/api/

# Generar Prisma client
RUN cd packages/database && pnpm prisma generate

# Compilar NestJS
RUN cd apps/api && pnpm build

# ────────────────────────────────────────────────────────────
# Stage 2: runner — imagen mínima de producción
# ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Habilita pnpm para el runner
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# Copiar lo compilado y dependencias del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

EXPOSE 3011

# Healthcheck: verifica que la API responde
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3011/api/v1/health || exit 1

CMD ["node", "apps/api/dist/main"]
