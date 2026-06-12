#!/bin/bash
# scripts/rollback.sh — Plan de rollback en cas d'échec de déploiement

set -e

BACKUP_NAME="${1:-DERNIER_BACKUP}"

echo "=== ROLLBACK VECTURA ==="
echo "⚠️  Cette opération va restaurer l'état précédent"
echo "→ Backup de restauration : ${BACKUP_NAME}"

read -p "Confirmer le rollback ? (OUI) : " CONFIRM
[ "$CONFIRM" != "OUI" ] && echo "Annulé" && exit 1

# 1. Mode maintenance
echo "→ Activation mode maintenance..."
sudo cp /var/www/vectura-frontend/maintenance.html /var/www/vectura-frontend/index.html

# 2. Arrêt des services
echo "→ Arrêt des services..."
docker-compose -f docker-compose.prod.yml down

# 3. Restauration base de données
echo "→ Restauration DB..."
if [ -f "/backups/${BACKUP_NAME}.sql.gz" ]; then
    gunzip -c "/backups/${BACKUP_NAME}.sql.gz" | docker exec -i vectura-postgres psql -U vectura -d postgres
else
    echo "❌ Backup DB non trouvé : /backups/${BACKUP_NAME}.sql.gz"
    exit 1
fi

# 4. Restauration uploads
echo "→ Restauration uploads..."
if [ -f "/backups/${BACKUP_NAME}-uploads.tar.gz" ]; then
    tar -xzf "/backups/${BACKUP_NAME}-uploads.tar.gz" -C /
fi

# 5. Checkout version précédente
echo "→ Restauration code..."
git log --oneline -5
git checkout HEAD~1  # Ou tag précédent

# 6. Redémarrage
echo "→ Redémarrage..."
docker-compose -f docker-compose.prod.yml up -d --build

# 7. Vérification
echo "→ Vérification..."
sleep 10
curl -sf http://localhost:3000/health && echo "✅ Rollback OK" || echo "❌ Rollback KO — intervention manuelle requise"

# 8. Désactivation maintenance
sudo rm -f /var/www/vectura-frontend/index.html
sudo cp /var/www/vectura-frontend/index.html.bak /var/www/vectura-frontend/index.html 2>/dev/null || true

echo "✅ Rollback terminé"