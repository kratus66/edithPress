#!/bin/bash
# =============================================================
# EdithPress — Backup de Base de Datos a S3/MinIO
# Usage:
#   bash scripts/backup-db.sh
#
# Variables de entorno requeridas (desde .env):
#   DATABASE_URL, S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME
# =============================================================
set -euo pipefail

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"
BACKUP_BUCKET="${S3_BUCKET_NAME:-edithpress-media}-backups"
RETAIN_DAYS=7

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting database backup..."

# ── Extraer credenciales de DATABASE_URL ──────────────────────
# Formato: postgresql://user:password@host:port/dbname
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

# ── Crear backup ──────────────────────────────────────────────
echo "  Dumping database $DB_NAME..."
PGPASSWORD="$DB_PASS" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  | gzip > "/tmp/$BACKUP_FILE"

echo "  Backup created: /tmp/$BACKUP_FILE ($(du -sh "/tmp/$BACKUP_FILE" | cut -f1))"

# ── Subir a S3/MinIO ──────────────────────────────────────────
echo "  Uploading to s3://$BACKUP_BUCKET/..."

AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" \
AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
aws s3 cp "/tmp/$BACKUP_FILE" \
  "s3://$BACKUP_BUCKET/$BACKUP_FILE" \
  --endpoint-url "${S3_ENDPOINT:-}" \
  --region "${S3_REGION:-us-east-1}"

echo "  ✓ Uploaded to s3://$BACKUP_BUCKET/$BACKUP_FILE"

# ── Limpiar local ─────────────────────────────────────────────
rm -f "/tmp/$BACKUP_FILE"

# ── Eliminar backups viejos (> RETAIN_DAYS días) ──────────────
echo "  Cleaning backups older than $RETAIN_DAYS days..."
CUTOFF_DATE=$(date -d "-${RETAIN_DAYS} days" '+%Y%m%d' 2>/dev/null || date -v "-${RETAIN_DAYS}d" '+%Y%m%d')

AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" \
AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
aws s3 ls "s3://$BACKUP_BUCKET/" \
  --endpoint-url "${S3_ENDPOINT:-}" \
  --region "${S3_REGION:-us-east-1}" \
  | awk '{print $4}' \
  | grep '^backup_' \
  | while read -r file; do
      FILE_DATE=$(echo "$file" | sed 's/backup_\([0-9]*\)_.*/\1/')
      if [ "$FILE_DATE" -lt "$CUTOFF_DATE" ] 2>/dev/null; then
        echo "    Deleting old backup: $file"
        AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY" \
        AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY" \
        aws s3 rm "s3://$BACKUP_BUCKET/$file" \
          --endpoint-url "${S3_ENDPOINT:-}" \
          --region "${S3_REGION:-us-east-1}"
      fi
    done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Backup complete."
