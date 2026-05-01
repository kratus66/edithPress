# EdithPress — Guía de Deploy

## Requisitos del servidor

- Ubuntu 22.04 LTS (recomendado)
- Docker ≥ 24 y Docker Compose ≥ 2.20
- Git
- Al menos 2 GB RAM, 20 GB disco
- Puertos 80 y 443 abiertos en el firewall

## Primer deploy (servidor nuevo)

### 1. Preparar el servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Clonar el repositorio
sudo mkdir -p /opt/edithpress
sudo chown $USER:$USER /opt/edithpress
git clone https://github.com/tu-org/edithpress /opt/edithpress
cd /opt/edithpress
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env   # completar todos los valores reales
```

Variables OBLIGATORIAS para producción:
- `DATABASE_URL` — conexión a Postgres
- `REDIS_URL` — conexión a Redis
- `JWT_SECRET` — mínimo 64 chars (generar con `openssl rand -hex 64`)
- `JWT_REFRESH_SECRET` — distinto al anterior
- `STRIPE_SECRET_KEY` — clave secreta de Stripe (sk_live_...)
- `STRIPE_WEBHOOK_SECRET` — desde el dashboard de Stripe
- `RESEND_API_KEY` — para emails transaccionales
- `S3_ACCESS_KEY` / `S3_SECRET_KEY` — credenciales MinIO/S3

### 3. Obtener certificados SSL

```bash
bash infrastructure/certbot/init-letsencrypt.sh
# Seguir las instrucciones en pantalla
```

### 4. Construir las imágenes

```bash
cd /opt/edithpress
bash scripts/deploy-staging.sh --build
```

### 5. Verificar el deploy

```bash
# Estado de los contenedores
docker compose -f docker-compose.prod.yml ps

# Logs de la API
docker compose -f docker-compose.prod.yml logs api --tail=50

# Health check manual
curl https://api.edithpress.com/api/v1/health
```

---

## Deploys posteriores (actualizaciones)

El CD automático se activa en cada push a `main` vía GitHub Actions.

Para deploy manual:

```bash
cd /opt/edithpress
git pull origin main
bash scripts/deploy-staging.sh
```

Para deploy con rebuild de imágenes:

```bash
bash scripts/deploy-staging.sh --build
```

---

## Staging Railway — Sprint 04

### Variables nuevas a configurar en Railway

Acceder a cada servicio en el dashboard de Railway (`railway.app → proyecto EdithPress → Environment: staging`).

**Servicio `api`** — agregar la siguiente variable:

| Variable | Valor | Cómo generarla |
|----------|-------|----------------|
| `IP_SALT` | `<hex aleatorio>` | `openssl rand -hex 32` |

> Esta variable se usa para hashear IPs en el módulo de analytics (GDPR).
> Nunca rotar este valor en producción sin avisar al equipo — rompe los conteos históricos de visitantes únicos.

**Servicio `renderer`** — agregar la siguiente variable:

| Variable | Valor |
|----------|-------|
| `API_INTERNAL_URL` | `http://api:3001` |

> Esta es la URL interna del servicio `api` dentro de la red privada de Railway.
> No usar la URL pública (`https://api.staging.edithpress.com`) para comunicación server-to-server — añade latencia innecesaria y sale de la red privada.

### Aplicar migrations en staging

Ejecutar después de cada deploy que incluya cambios de schema:

```bash
railway run --service api pnpm --filter @edithpress/database exec prisma migrate deploy
railway run --service api pnpm db:seed
```

### Smoke tests post-deploy

Verificar manualmente (o con curl) que los endpoints clave responden correctamente:

```bash
# 1. Health check de la API
curl -s https://api.staging.edithpress.com/api/v1/health
# Respuesta esperada: { "status": "ok" }

# 2. Lista de templates (endpoint público)
curl -s https://api.staging.edithpress.com/api/v1/templates
# Respuesta esperada: array JSON de templates (puede estar vacío si no hay seed)

# 3. Pantalla de login del admin panel
curl -sI https://admin.staging.edithpress.com/login
# Respuesta esperada: HTTP 200
```

---

## Secrets requeridos en GitHub Actions

Configurar en: `Settings → Environments → staging → Secrets`

| Secret | Descripción |
|--------|-------------|
| `STAGING_HOST` | IP o dominio del servidor |
| `STAGING_USER` | Usuario SSH (ej: `ubuntu`) |
| `STAGING_SSH_KEY` | Clave privada SSH (contenido del archivo `~/.ssh/id_rsa`) |
| `STAGING_PORT` | Puerto SSH (opcional, default: 22) |
| `RENDERER_SECRET` | Shared secret entre builder y renderer (32 bytes hex) |
| `NEXT_PUBLIC_RENDERER_SECRET` | Mismo valor que `RENDERER_SECRET` (expuesto al browser) |
| `IP_SALT` | Salt para hashear IPs en analytics — `openssl rand -hex 32` |

---

## Monitoreo

Uptime Kuma corre en el mismo servidor en el puerto 3100:

```bash
# Levantar monitoreo (separado del stack principal)
docker compose -f infrastructure/monitoring/docker-compose.monitoring.yml up -d
```

Panel: `http://servidor:3100`
Ver `docs/monitoring-setup.md` para configuración de los 5 monitores.

---

## Backups

Los backups se ejecutan automáticamente cada día a las 2am UTC.
Se guardan en el bucket S3 configurado en `S3_BUCKET_NAME-backups`.
Se retienen los últimos 7 días.

Para backup manual:

```bash
source .env && bash scripts/backup-db.sh
```

---

## Troubleshooting

**La API no arranca:**
```bash
docker compose -f docker-compose.prod.yml logs api
# Verificar DATABASE_URL y REDIS_URL en .env
```

**Nginx devuelve 502:**
```bash
docker compose -f docker-compose.prod.yml ps
# Verificar que api/admin/builder/renderer están healthy
```

**Certificado SSL expirado:**
```bash
sudo certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```
