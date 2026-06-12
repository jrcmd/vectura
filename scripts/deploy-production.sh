#!/bin/bash
# scripts/deploy-production.sh — Déploiement production Vectura

set -e

VERSION="${1:-latest}"
BACKUP_NAME="pre-deploy-$(date +%Y%m%d_%H%M%S)"

echo "=== Déploiement Production Vectura v${VERSION} ==="

# 1. Backup
echo "→ Étape 1 : Backup pré-déploiement..."
./scripts/pre-deploy-backup.sh

# 2. Mode maintenance (optionnel)
echo "→ Étape 2 : Activation mode maintenance..."
sudo cp /var/www/vectura-frontend/maintenance.html /var/www/vectura-frontend/index.html.bak

# 3. Pull du code
echo "→ Étape 3 : Mise à jour du code..."
git fetch origin
git checkout "${VERSION}"
git pull origin "${VERSION}"

# 4. Build backend
echo "→ Étape 4 : Build backend..."
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
cd ..

# 5. Build frontend
echo "→ Étape 5 : Build frontend..."
cd frontend
npm ci
npm run build
cd ..

# 6. Déploiement Docker
echo "→ Étape 6 : Déploiement Docker..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build

# 7. Attente healthcheck
echo "→ Étape 7 : Vérification santé..."
sleep 15
for i in {1..10}; do
    if curl -sf http://localhost:3000/health > /dev/null; then
        echo "✅ Backend healthy"
        break
    fi
    if [ "$i" -eq 10 ]; then
        echo "❌ Healthcheck échoué — ROLLBACK"
        ./scripts/rollback.sh "${BACKUP_NAME}"
        exit 1
    fi
    echo "→ Attente healthcheck... ($i/10)"
    sleep 5
done

# 8. Déploiement frontend
echo "→ Étape 8 : Déploiement frontend..."
cp -r frontend/build/* /var/www/vectura-frontend/

# 9. Désactivation maintenance
echo "→ Étape 9 : Désactivation mode maintenance..."
[ -f /var/www/vectura-frontend/index.html.bak ] && rm /var/www/vectura-frontend/index.html.bak

# 10. Vérifications finales
echo "→ Étape 10 : Vérifications finales..."
curl -sf https://api.vectura.fr/health || (echo "❌ API inaccessible"; exit 1)
curl -sf https://app.vectura.fr || (echo "❌ Frontend inaccessible"; exit 1)

echo ""
echo "🎉 Déploiement production v${VERSION} réussi !"
echo "📊 Vérifiez les logs : docker logs -f vectura-backend"