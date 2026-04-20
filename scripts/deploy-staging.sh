#!/bin/bash
# =============================================================
# EdithPress — Deploy to Staging
# Usage:
#   bash scripts/deploy-staging.sh           # usa imágenes existentes
#   bash scripts/deploy-staging.sh --build   # fuerza rebuild de imágenes
# =============================================================
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
BUILD=false

for arg in "$@"; do
  case $arg in
    --build) BUILD=true ;;
  esac
done

echo "============================================"
echo "  EdithPress — Deploy Staging"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"

# ── 1. Verificar que .env existe ──────────────────────────────
if [ ! -f ".env" ]; then
  echo "[ERROR] .env no encontrado. Copia .env.example y configura los valores."
  exit 1
fi

# ── 2. Build de imágenes (opcional) ──────────────────────────
if [ "$BUILD" = true ]; then
  echo ""
  echo "[1/5] Building Docker images..."
  docker build -f apps/api/Dockerfile      -t edithpress-api      . --no-cache
  docker build -f apps/admin/Dockerfile    -t edithpress-admin    . --no-cache
  docker build -f apps/builder/Dockerfile  -t edithpress-builder  . --no-cache
  docker build -f apps/renderer/Dockerfile -t edithpress-renderer . --no-cache
  echo "      ✓ Images built"
else
  echo ""
  echo "[1/5] Skipping image build (use --build to rebuild)"
fi

# ── 3. Correr migraciones de Prisma ──────────────────────────
echo ""
echo "[2/5] Running database migrations..."
docker compose -f "$COMPOSE_FILE" run --rm --no-deps \
  -e DATABASE_URL="${DATABASE_URL}" \
  api node -e "
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: '/app' });
  " 2>/dev/null || {
  echo "      ⚠ Migration via container failed, trying direct prisma..."
  cd packages/database && pnpm prisma migrate deploy && cd ../..
}
echo "      ✓ Migrations applied"

# ── 4. Levantar servicios ─────────────────────────────────────
echo ""
echo "[3/5] Starting services..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
echo "      ✓ Services started"

# ── 5. Health check ───────────────────────────────────────────
echo ""
echo "[4/5] Waiting for API to be healthy..."
MAX_RETRIES=12
RETRY_INTERVAL=5
for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf http://localhost:3011/api/v1/health > /dev/null 2>&1; then
    echo "      ✓ API is healthy"
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "      ✗ API health check failed after $((MAX_RETRIES * RETRY_INTERVAL))s"
    docker compose -f "$COMPOSE_FILE" logs api --tail=50
    exit 1
  fi
  echo "      Attempt $i/$MAX_RETRIES — waiting ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

# ── 6. Estado final ───────────────────────────────────────────
echo ""
echo "[5/5] Service status:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "============================================"
echo "  ✓ Deploy complete"
echo "  Admin:   https://admin.edithpress.com"
echo "  API:     https://api.edithpress.com"
echo "  Builder: https://builder.edithpress.com"
echo "============================================"
