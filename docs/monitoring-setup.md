# EdithPress — Configuración de Monitoreo (Uptime Kuma)

## Levantar Uptime Kuma

```bash
docker compose -f infrastructure/monitoring/docker-compose.monitoring.yml up -d
```

Acceder en: `http://servidor:3100`
En el primer acceso, crear un usuario administrador.

---

## Monitores a configurar manualmente

### Monitor 1 — API Health
- **Tipo**: HTTP(s)
- **URL**: `https://api.edithpress.com/api/v1/health`
- **Intervalo**: 60 segundos
- **Código esperado**: 200
- **Nombre**: `API — Health Check`

### Monitor 2 — Admin Panel
- **Tipo**: HTTP(s)
- **URL**: `https://admin.edithpress.com`
- **Intervalo**: 60 segundos
- **Código esperado**: 200
- **Nombre**: `Admin — Panel`

### Monitor 3 — Visual Builder
- **Tipo**: HTTP(s)
- **URL**: `https://builder.edithpress.com`
- **Intervalo**: 60 segundos
- **Código esperado**: 200
- **Nombre**: `Builder — Editor`

### Monitor 4 — Renderer (sitio de demo)
- **Tipo**: HTTP(s)
- **URL**: `https://demo.edithpress.com`
- **Intervalo**: 60 segundos
- **Código esperado**: 200
- **Nombre**: `Renderer — Demo Tenant`

### Monitor 5 — Postgres (TCP interno)
- **Tipo**: TCP Port
- **Host**: `localhost` (o IP interna del servidor)
- **Puerto**: `5432`
- **Intervalo**: 120 segundos
- **Nombre**: `DB — Postgres`

---

## Notificaciones recomendadas

Configurar en Uptime Kuma → Settings → Notifications:

- **Email**: usar Resend o SMTP propio
- **Slack**: webhook al canal #alerts del equipo
- **Telegram**: bot para alertas inmediatas en móvil

Criterio de alerta: notificar si un monitor falla **2 veces consecutivas**
(para evitar falsos positivos por picos de latencia).

---

## Estado de los contenedores

Para revisar el estado directamente desde el servidor:

```bash
# Estado general
docker compose -f docker-compose.prod.yml ps

# Logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Uso de recursos
docker stats
```
