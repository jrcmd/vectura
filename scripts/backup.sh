#!/bin/bash
# scripts/backup.sh — Sauvegarde chiffrée PostgreSQL

set -e

# Configuration
DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-vectura}"
DB_NAME="${DB_NAME:-vectura_prod}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/vectura_backup_${TIMESTAMP}.sql"

# Vérification de la clé de chiffrement
if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
    echo "❌ ERREUR : BACKUP_ENCRYPTION_KEY non définie"
    exit 1
fi

echo "=== Backup Vectura — ${TIMESTAMP} ==="

# Création du backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
    --clean --if-exists --create \
    --no-owner --no-privileges \
    > "$BACKUP_FILE"

echo "✅ Backup créé : ${BACKUP_FILE}"

# Compression
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup compressé : ${BACKUP_FILE}"

# Chiffrement GPG
gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --symmetric --cipher-algo AES256 \
    --output "${BACKUP_FILE}.gpg" \
    "$BACKUP_FILE"

# Suppression du fichier non chiffré
rm "$BACKUP_FILE"

echo "✅ Backup chiffré : ${BACKUP_FILE}.gpg"

# Vérification du backup
gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --decrypt "${BACKUP_FILE}.gpg" | head -c 100 > /dev/null

echo "✅ Vérification du backup OK"

# Nettoyage des anciens backups
find "$BACKUP_DIR" -name "vectura_backup_*.gpg" -mtime +$RETENTION_DAYS -delete

echo "✅ Nettoyage des backups de +${RETENTION_DAYS} jours effectué"

# Statistiques
BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gpg" | cut -f1)
echo "📊 Taille du backup : ${BACKUP_SIZE}"
echo "=== Backup terminé avec succès ==="