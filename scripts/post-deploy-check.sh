#!/bin/bash
# scripts/post-deploy-check.sh — Vérifications post-déploiement

set -e

echo "=== Vérifications Post-Déploiement ==="

# 1. Healthcheck API
echo "→ 1. Healthcheck API..."
curl -sf https://api.vectura.fr/health && echo "✅ OK" || (echo "❌ KO"; exit 1)

# 2. Variables d'environnement (masquées)
echo "→ 2. Variables d'environnement..."
docker exec vectura-backend env | grep NODE_ENV | grep -q production && echo "✅ NODE_ENV=production" || echo "❌ NODE_ENV incorrect"

# 3. Connexion base de données
echo "→ 3. Connexion DB..."
docker exec -it vectura-postgres psql -U vectura -c "SELECT version();" | grep -q PostgreSQL && echo "✅ DB connectée" || echo "❌ DB KO"

# 4. Redis
echo "→ 4. Redis..."
docker exec -it vectura-redis redis-cli ping | grep -q PONG && echo "✅ Redis OK" || echo "❌ Redis KO"

# 5. Espace disque
echo "→ 5. Espace disque..."
df -h / | awk 'NR==2 {print "   Disponible : "$4}'

# 6. Logs d'erreur (5 dernières minutes)
echo "→ 6. Logs d'erreur (5 min)..."
ERRORS=$(docker logs --since=5m vectura-backend 2>&1 | grep -ci error || true)
echo "   Erreurs détectées : ${ERRORS}"
[ "$ERRORS" -lt 5 ] && echo "✅ Niveau d'erreurs acceptable" || echo "⚠️ Trop d'erreurs — investiguer"

# 7. SSL
echo "→ 7. SSL..."
echo | openssl s_client -servername api.vectura.fr -connect api.vectura.fr:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter

# 8. Conteneurs en cours
echo "→ 8. Conteneurs..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Vérifications post-déploiement terminées"