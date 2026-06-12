#!/bin/bash
# scripts/cleanup-logs.sh — Nettoyage des logs Vectura

echo "=== Nettoyage des logs ==="

# Logs Nginx (rotation + compression)
find /var/log/nginx/ -name "access.log.*" -mtime +30 -delete
find /var/log/nginx/ -name "error.log.*" -mtime +30 -delete

# Logs Docker
docker system prune -f --volumes

# Logs applicatifs
find /opt/vectura/backend/logs/ -name "*.log" -mtime +14 -delete
find /var/log/vectura-*.log -mtime +30 -delete

# Backups temporaires
find /tmp/ -name "restore_*.sql.gz" -mtime +1 -delete

echo "✅ Nettoyage terminé"