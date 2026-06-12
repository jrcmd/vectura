#!/bin/bash
# scripts/verify-backups.sh — Vérification quotidienne des backups

BACKUP_DIR="${BACKUP_DIR:-/backups}"
LOG_FILE="/var/log/vectura-backup-verify.log"

echo "$(date) : Vérification des backups" >> "$LOG_FILE"

# Vérifier qu'au moins un backup existe
if [ -z "$(ls -A ${BACKUP_DIR}/*.gpg 2>/dev/null)" ]; then
    echo "$(date) : ❌ Aucun backup GPG trouvé" >> "$LOG_FILE"
    exit 1
fi

# Vérifier le backup le plus récent
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/*.gpg 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
    echo "$(date) : ❌ Impossible de trouver le backup le plus récent" >> "$LOG_FILE"
    exit 1
fi

# Vérifier la date (moins de 24h pour les backups automatiques)
BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 3600 ))
echo "$(date) : Backup le plus récent : ${LATEST_BACKUP} (${BACKUP_AGE}h)" >> "$LOG_FILE"

if [ "$BACKUP_AGE" -gt 24 ]; then
    echo "$(date) : ⚠️ Backup de plus de 24h — vérifier le service de backup" >> "$LOG_FILE"
fi

# Vérifier l'intégrité GPG
if gpg --batch --yes --passphrase "${BACKUP_ENCRYPTION_KEY:-}" --decrypt "$LATEST_BACKUP" 2>/dev/null | head -c 100 > /dev/null; then
    echo "$(date) : ✅ Intégrité du backup vérifiée" >> "$LOG_FILE"
else
    echo "$(date) : ❌ ERREUR : Backup corrompu ou clé invalide" >> "$LOG_FILE"
    exit 1
fi

echo "$(date) : ✅ Vérification des backups terminée" >> "$LOG_FILE"