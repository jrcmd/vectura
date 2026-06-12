#!/bin/bash
# scripts/smoke-tests.sh — Tests de fumée post-déploiement

set -e

BASE_URL="${1:-https://staging-api.vectura.fr}"
FRONTEND_URL="${2:-https://staging-app.vectura.fr}"

echo "=== Smoke Tests Vectura ==="
echo "→ API : ${BASE_URL}"
echo "→ Frontend : ${FRONTEND_URL}"

# Test 1 : Healthcheck API
echo "→ Test 1 : Healthcheck API..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health")
if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Healthcheck KO (HTTP ${HTTP_STATUS})"
    exit 1
fi
echo "✅ Healthcheck OK"

# Test 2 : Landing page frontend
echo "→ Test 2 : Landing page..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}")
if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Landing page KO (HTTP ${HTTP_STATUS})"
    exit 1
fi
echo "✅ Landing page OK"

# Test 3 : Headers de sécurité
echo "→ Test 3 : Headers de sécurité..."
HEADERS=$(curl -s -I "${BASE_URL}/health")
echo "$HEADERS" | grep -q "X-Frame-Options" || (echo "❌ X-Frame-Options manquant"; exit 1)
echo "$HEADERS" | grep -q "X-Content-Type-Options" || (echo "❌ X-Content-Type-Options manquant"; exit 1)
echo "✅ Headers de sécurité OK"

# Test 4 : Rate limiting
echo "→ Test 4 : Rate limiting..."
for i in {1..7}; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/auth/login" -X POST)
    if [ "$i" -eq 7 ] && [ "$RESPONSE" != "429" ]; then
        echo "❌ Rate limiting non actif (HTTP ${RESPONSE} au lieu de 429)"
        exit 1
    fi
done
echo "✅ Rate limiting OK"

# Test 5 : Inscription chauffeur (simulation)
echo "→ Test 5 : Inscription chauffeur..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register-driver" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@staging.vectura","password":"Test1234!","firstName":"Test","lastName":"Staging","phone":"+33612345678","city":"Paris"}')

echo "$REGISTER_RESPONSE" | grep -q "id" || (echo "❌ Inscription chauffeur KO"; exit 1)
echo "✅ Inscription chauffeur OK"

# Test 6 : Connexion
echo "→ Test 6 : Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@staging.vectura","password":"Test1234!"}')

echo "$LOGIN_RESPONSE" | grep -q "accessToken" || (echo "❌ Login KO"; exit 1)
echo "✅ Connexion OK"

# Test 7 : SSL
echo "→ Test 7 : SSL..."
SSL_DAYS=$(echo | openssl s_client -servername api.vectura.fr -connect api.vectura.fr:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
echo "✅ SSL valide jusqu'au ${SSL_DAYS}"

echo ""
echo "🎉 Tous les smoke tests sont passés !"