# Agente 09 — DevOps Engineer
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: DevOps Engineer
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como DevOps Engineer de EdithPress, lee docs/agents/09-devops-engineer.md"

---

## Responsabilidades
- Docker Compose para entorno de desarrollo local
- Dockerfile por cada app del monorepo
- CI/CD con GitHub Actions (test → build → deploy)
- Deploy en producción (Railway o VPS con Nginx)
- SSL automático (Let's Encrypt / Cloudflare)
- Wildcard DNS (`*.edithpress.com`) para subdominios de tenants
- Custom domains: proxy reverso que mapea dominios → renderer
- Gestión de variables de entorno y secretos
- Monitoreo, alertas y uptime checks
- Scripts de backup de base de datos

## Stack / Herramientas
- Docker + docker-compose
- Nginx (reverse proxy)
- GitHub Actions
- Railway (staging) / VPS Ubuntu (prod)
- Cloudflare (DNS, SSL, proxy)
- Certbot / Let's Encrypt (si no Cloudflare)
- Sentry (error tracking)
- Better Uptime o UptimeRobot (uptime)

## Dependencias con otros agentes
- Recibe de: Architect (estructura de apps), Backend (variables de entorno), Security (hardening)
- Entrega a: todos (entornos funcionando, URLs de staging/prod)

---

## Docker Compose — Desarrollo Local

### Servicios levantados con `docker-compose up`
```yaml
services:
  postgres:    → localhost:5432
  redis:       → localhost:6379
  minio:       → localhost:9000 (S3-compatible para dev)
  mailpit:     → localhost:8025 (SMTP local, preview de emails)
```

### Lo que NO corre en Docker en dev
Las 4 apps corren con `pnpm dev` en el host (hot reload más rápido):
- api → localhost:3001
- admin → localhost:3000
- builder → localhost:3002
- renderer → localhost:3003

---

## docker-compose.yml (desarrollo)
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: edithpress_dev
      POSTGRES_USER: edithpress
      POSTGRES_PASSWORD: devpassword123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U edithpress"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"    # MinIO Console
    environment:
      MINIO_ROOT_USER: minio_dev
      MINIO_ROOT_PASSWORD: minio_dev_password
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  mailpit:
    image: axllent/mailpit:latest
    ports:
      - "1025:1025"    # SMTP
      - "8025:8025"    # Web UI
    environment:
      MP_MAX_MESSAGES: 100

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## GitHub Actions — CI Pipeline

### .github/workflows/ci.yml
```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint-typecheck
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_DB: test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

---

## Nginx — Configuración de Subdominios

### Wildcard subdominio (`*.edithpress.com → renderer`)
```nginx
server {
    listen 443 ssl;
    server_name ~^(?<tenant>[^.]+)\.edithpress\.com$;

    ssl_certificate /etc/letsencrypt/live/edithpress.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/edithpress.com/privkey.pem;

    location / {
        proxy_pass http://renderer:3003;
        proxy_set_header X-Tenant-Slug $tenant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Admin panel
server {
    listen 443 ssl;
    server_name admin.edithpress.com;
    location / { proxy_pass http://admin:3000; }
}

# API
server {
    listen 443 ssl;
    server_name api.edithpress.com;
    location / { proxy_pass http://api:3001; }
}
```

### Custom domains (`miempresa.com → renderer`)
```nginx
server {
    listen 443 ssl;
    server_name _;   # Catch-all para dominios custom

    location / {
        proxy_pass http://renderer:3003;
        proxy_set_header X-Tenant-Domain $host;
        proxy_set_header Host $host;
    }
}
```

---

## Variables de Entorno por Entorno

| Variable | Dev | Staging | Prod |
|----------|-----|---------|------|
| DATABASE_URL | localhost:5432 | Railway Postgres | RDS/Supabase |
| REDIS_URL | localhost:6379 | Railway Redis | Upstash Redis |
| AWS_BUCKET | minio local | R2 staging | R2 prod |
| NEXT_PUBLIC_API_URL | localhost:3001 | api.staging.edithpress.com | api.edithpress.com |

---

## Checklist de Progreso

### FASE 0
- [x] docker-compose.yml diseñado
- [x] CI pipeline diseñado
- [x] Nginx config diseñada
- [ ] docker-compose.yml creado en el repo
- [ ] Postgres + Redis + MinIO + Mailpit levantados y funcionando
- [ ] Script de setup inicial (setup.sh)
- [ ] .env.example completo con todas las variables
- [ ] GitHub Actions CI básico (lint + typecheck + test)

### FASE 1 — MVP
- [ ] Dockerfiles para cada app (multi-stage builds)
- [ ] docker-compose.prod.yml
- [ ] Deploy en Railway (staging)
- [ ] Nginx config básico en staging
- [ ] SSL con Cloudflare en staging
- [ ] Wildcard DNS `*.edithpress.com` en staging
- [ ] Pipeline de deploy automático (push to main → deploy staging)

### FASE 2 — v1
- [ ] Deploy en producción (VPS o Railway prod)
- [ ] Custom domains: proxy headers funcionando
- [ ] Backups automáticos de Postgres (daily)
- [ ] Monitoreo con Sentry integrado en todas las apps
- [ ] Uptime monitoring configurado
- [ ] Runbook de deployment documentado

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
