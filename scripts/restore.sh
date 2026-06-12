#!/bin/bash
# scripts/restore.sh — Restauration d'un backup

set -e

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-vectura}"
DB_NAME="${DB_NAME:-vectura_prod}"
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <fichier_backup.gpg>"
    echo "Backups disponibles :"
    ls -lah /backups/*.gpg 2>/dev/null || echo "Aucun backup trouvé"
    exit 1
fi

if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
    echo "❌ ERREUR : BACKUP_ENCRYPTION_KEY non définie"
    exit 1
fi

echo "⚠️  RESTAURATION — Cette opération va ÉCRASER la base ${DB_NAME}"
read -p "Êtes-vous sûr ? (tapez 'OUI' pour confirmer) : " CONFIRM

if [ "$CONFIRM" != "OUI" ]; then
    echo "❌ Restauration annulée"
    exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== Restauration Vectura — ${TIMESTAMP} ==="

# Backup de sécurité avant restauration
echo "→ Création d'un backup de sécurité..."
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | gzip > "/backups/pre-restore-${TIMESTAMP}.sql.gz"

# Déchiffrement
echo "→ Déchiffrement du backup..."
gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --decrypt "$BACKUP_FILE" > "/tmp/restore_${TIMESTAMP}.sql.gz"

# Restauration
echo "→ Restauration de la base..."
gunzip -c "/tmp/restore_${TIMESTAMP}.sql.gz" | psql -h "$DB_HOST" -U "$DB_USER" -d postgres

# Nettoyage
rm "/tmp/restore_${TIMESTAMP}.sql.gz"

echo "✅ Restauration terminée avec succès"
echo "⚠️  Vérifiez les données et redémarrez les services si nécessaire"