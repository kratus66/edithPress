#!/usr/bin/env bash
# ============================================================
# EdithPress — Developer Environment Setup
# ============================================================
# Usage: ./infrastructure/scripts/setup.sh
#
# What this does:
#   1. Checks Node >= 20 and pnpm >= 9
#   2. Copies .env.example to .env (if not already present)
#   3. Starts Docker services (postgres, redis, minio, mailpit)
#   4. Waits for Postgres and Redis to be healthy
#   5. Installs Node dependencies (pnpm install)
#   6. Generates Prisma client (pnpm db:generate)
#   7. Runs database migrations (pnpm db:migrate)
#   8. Seeds initial data (pnpm db:seed)
#   9. Prints service URLs
# ============================================================

set -euo pipefail

# ---- Colors ------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}  ✓${RESET} $1"; }
info() { echo -e "${CYAN}  →${RESET} $1"; }
warn() { echo -e "${YELLOW}  ⚠${RESET} $1"; }
fail() { echo -e "${RED}  ✗ ERROR:${RESET} $1"; exit 1; }
step() { echo -e "\n${BOLD}[${1}]${RESET} ${2}"; }

# Move to repo root regardless of where the script is called from
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo -e "\n${BOLD}============================================================${RESET}"
echo -e "${BOLD}   EdithPress — Developer Environment Setup${RESET}"
echo -e "${BOLD}============================================================${RESET}"

# ============================================================
# STEP 1 — Check prerequisites
# ============================================================
step "1/8" "Checking prerequisites"

# Node.js >= 20
if ! command -v node &>/dev/null; then
  fail "Node.js is not installed. Install from https://nodejs.org (v20+)"
fi
NODE_VERSION=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_VERSION" -lt 20 ]; then
  fail "Node.js >= 20 required. Current: $(node --version)"
fi
ok "Node.js $(node --version)"

# pnpm >= 9
if ! command -v pnpm &>/dev/null; then
  fail "pnpm is not installed. Run: npm install -g pnpm@9"
fi
PNPM_VERSION=$(pnpm --version | cut -d. -f1)
if [ "$PNPM_VERSION" -lt 9 ]; then
  fail "pnpm >= 9 required. Current: $(pnpm --version). Run: npm install -g pnpm@9"
fi
ok "pnpm $(pnpm --version)"

# Docker
if ! command -v docker &>/dev/null; then
  fail "Docker is not installed. Install from https://docs.docker.com/get-docker"
fi
ok "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"

# ============================================================
# STEP 2 — Copy .env.example → .env
# ============================================================
step "2/8" "Environment variables"

if [ -f ".env" ]; then
  warn ".env already exists — skipping copy. Update it manually if needed."
else
  cp .env.example .env
  ok "Created .env from .env.example"
  warn "Open .env and fill in STRIPE_, JWT_SECRET, and any other CHANGE_ME values."
fi

# ============================================================
# STEP 3 — Start Docker services
# ============================================================
step "3/8" "Starting Docker services (postgres, redis, minio, mailpit)"

docker compose up -d
ok "Docker services started"

# ============================================================
# STEP 4 — Wait for Postgres and Redis to be healthy
# ============================================================
step "4/8" "Waiting for services to be healthy"

wait_healthy() {
  local SERVICE="$1"
  local MAX_RETRIES=30
  local RETRY=0
  info "Waiting for $SERVICE..."
  until [ "$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q "$SERVICE" 2>/dev/null)" 2>/dev/null)" = "healthy" ]; do
    RETRY=$((RETRY + 1))
    if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
      fail "$SERVICE did not become healthy after ${MAX_RETRIES} retries. Run: docker compose logs $SERVICE"
    fi
    sleep 2
  done
  ok "$SERVICE is healthy"
}

wait_healthy postgres
wait_healthy redis

# ============================================================
# STEP 5 — Install Node dependencies
# ============================================================
step "5/8" "Installing Node dependencies"

pnpm install --frozen-lockfile
ok "Dependencies installed"

# ============================================================
# STEP 6 — Generate Prisma client
# ============================================================
step "6/8" "Generating Prisma client"

pnpm db:generate
ok "Prisma client generated"

# ============================================================
# STEP 7 — Run database migrations
# ============================================================
step "7/8" "Running database migrations"

pnpm db:migrate
ok "Migrations applied"

# ============================================================
# STEP 8 — Seed database
# ============================================================
step "8/8" "Seeding database with initial data"

pnpm db:seed
ok "Database seeded"

# ============================================================
# Done — print service URLs
# ============================================================
echo -e "\n${BOLD}${GREEN}============================================================${RESET}"
echo -e "${BOLD}${GREEN}   Setup complete! Start developing:${RESET}"
echo -e "${BOLD}${GREEN}============================================================${RESET}"
echo -e ""
echo -e "  ${BOLD}Start all apps:${RESET}   pnpm dev"
echo -e ""
echo -e "  ${BOLD}Apps (run via pnpm dev):${RESET}"
echo -e "    Admin      →  ${CYAN}http://localhost:3000${RESET}"
echo -e "    API        →  ${CYAN}http://localhost:3001${RESET}"
echo -e "    Builder    →  ${CYAN}http://localhost:3002${RESET}"
echo -e "    Renderer   →  ${CYAN}http://localhost:3003${RESET}"
echo -e ""
echo -e "  ${BOLD}Infrastructure services (Docker):${RESET}"
echo -e "    Postgres   →  ${CYAN}localhost:5432${RESET}"
echo -e "    Redis      →  ${CYAN}localhost:6379${RESET}"
echo -e "    MinIO API  →  ${CYAN}http://localhost:9000${RESET}"
echo -e "    MinIO UI   →  ${CYAN}http://localhost:9001${RESET}  (minio_dev / minio_dev_password)"
echo -e "    Mailpit    →  ${CYAN}http://localhost:8025${RESET}  (preview sent emails)"
echo -e ""
