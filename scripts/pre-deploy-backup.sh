#!/bin/bash
# scripts/pre-deploy-backup.sh — Backup pré-déploiement

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="pre-deploy-${TIMESTAMP}"

echo "=== Backup pré-déploiement ==="

# Backup base de données
docker exec vectura-postgres pg_dump -U vectura -d vectura_prod | gzip > "/backups/${BACKUP_NAME}.sql.gz"

# Backup uploads
tar -czf "/backups/${BACKUP_NAME}-uploads.tar.gz" /var/lib/docker/volumes/vectura_uploads/

# Backup configuration
tar -czf "/backups/${BACKUP_NAME}-config.tar.gz" /opt/vectura/.env.production /opt/vectura/docker-compose.prod.yml /etc/nginx/

# Vérification
ls -lah "/backups/${BACKUP_NAME}"*

echo "✅ Backup pré-déploiement créé : ${BACKUP_NAME}"