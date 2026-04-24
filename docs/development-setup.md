# EdithPress — Development Setup

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm@9`)
- Docker Desktop (for Postgres, Redis, MinIO, Mailpit)

## First-time setup

```bash
# 1. Clone and install dependencies
git clone <repo>
cd appEdithPress
pnpm install

# 2. Copy env file and fill in your values
cp .env.example .env

# 3. Start infrastructure services
docker compose up -d

# 4. Run database migrations and seed
cd packages/database
pnpm prisma migrate dev
pnpm prisma db seed

# 5. Start all apps
cd ../..
pnpm dev
```

Apps will be running at:

| App      | URL                        |
|----------|----------------------------|
| Admin    | http://localhost:3010      |
| API      | http://localhost:3011      |
| Builder  | http://localhost:3002      |
| Renderer | http://localhost:3003      |
| MinIO UI | http://localhost:9001      |
| Mailpit  | http://localhost:8025      |

---

## Wildcard DNS for multi-tenant testing

The renderer serves different content per tenant via subdomains (e.g. `mytenant.edithpress.com`).
In development you need to route `*.localhost` or `*.edithpress.local` to `127.0.0.1`.

### Option 1 — `/etc/hosts` (simplest, manual)

Add one entry per tenant you want to test:

```
# /etc/hosts
127.0.0.1  demo-agency.localhost
127.0.0.1  my-company.localhost
```

Then access the renderer at `http://demo-agency.localhost:3003`.

The renderer middleware already handles `.localhost` subdomains — it extracts `demo-agency` as the tenant slug.

### Option 2 — dnsmasq (Mac / Linux, wildcard)

Install dnsmasq and configure a wildcard entry so **any** subdomain resolves locally without editing `/etc/hosts`:

**macOS (Homebrew):**
```bash
brew install dnsmasq

# Add wildcard rule
echo 'address=/.edithpress.local/127.0.0.1' >> $(brew --prefix)/etc/dnsmasq.conf

# Start service
sudo brew services start dnsmasq

# Tell macOS to use dnsmasq for .edithpress.local
sudo mkdir -p /etc/resolver
echo 'nameserver 127.0.0.1' | sudo tee /etc/resolver/edithpress.local
```

**Linux (systemd):**
```bash
sudo apt install dnsmasq
echo 'address=/.edithpress.local/127.0.0.1' | sudo tee -a /etc/dnsmasq.conf
sudo systemctl restart dnsmasq
```

Then update `RENDERER_PUBLIC_URL` in your `.env`:
```
RENDERER_PUBLIC_URL=http://localhost:3003
ROOT_DOMAIN=edithpress.local
```

And access the renderer at `http://demo-agency.edithpress.local:3003`.

> **Note for Windows:** dnsmasq is not available natively. Use Option 1 (edit `C:\Windows\System32\drivers\etc\hosts`) or Option 3 below.

### Option 3 — ngrok / Cloudflare Tunnel (HTTPS + public URL)

Use this when you need real HTTPS or need to share the dev environment externally (e.g., for Stripe webhooks or testing on mobile).

**ngrok:**
```bash
# Install ngrok, then expose the renderer:
ngrok http --subdomain=demo-agency 3003
# → https://demo-agency.ngrok.io
```

**Cloudflare Tunnel (free):**
```bash
# Install cloudflared, then:
cloudflared tunnel --url http://localhost:3003
```

---

## Database

```bash
# Run migrations
cd packages/database && pnpm prisma migrate dev

# Reset + reseed (destructive!)
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio

# Generate client after schema changes
pnpm prisma generate
```

## Useful commands

```bash
# Build all apps
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format
```

## Production build (Docker)

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f api

# Stop
docker compose -f docker-compose.prod.yml down
```

Build context must always be the **monorepo root**. Do not run `docker build` from inside an app directory.
