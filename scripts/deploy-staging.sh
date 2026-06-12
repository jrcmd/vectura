#!/bin/bash
# scripts/deploy-staging.sh — Déploiement staging Vectura

set -e

STAGING_HOST="staging.vectura.fr"
STAGING_DIR="/opt/vectura-staging"
BRANCH="${1:-develop}"

echo "=== Déploiement Staging Vectura ==="
echo "→ Branche : ${BRANCH}"

# Connexion SSH et déploiement
ssh root@${STAGING_HOST} << 'REMOTE'
    # Arrêt des services
    cd ${STAGING_DIR}
    docker-compose -f docker-compose.staging.yml down

    # Mise à jour du code
    git fetch origin
    git checkout ${BRANCH}
    git pull origin ${BRANCH}

    # Installation des dépendances
    cd backend
    npm ci
    npx prisma generate
    npx prisma migrate deploy
    npm run build

    cd ../frontend
    npm ci
    npm run build

    # Copie du build frontend
    cp -r build/* /var/www/vectura-staging/

    # Démarrage
    cd ${STAGING_DIR}
    docker-compose -f docker-compose.staging.yml up -d --build

    # Healthcheck
    sleep 10
    curl -f http://localhost:3000/health || exit 1

    echo "✅ Staging déployé avec succès"
REMOTE