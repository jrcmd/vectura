#!/bin/bash
# scripts/pre-deploy-check.sh — Vérifications pré-déploiement Vectura

set -e

echo "🔍 Vérifications pré-déploiement Vectura"

# 1. Lint backend
echo "→ ESLint backend..."
cd backend
npm run lint

# 2. Tests backend
echo "→ Tests backend..."
npm run test:ci

# 3. Build backend
echo "→ Build backend TypeScript..."
npm run build

# 4. Lint frontend
echo "→ ESLint frontend..."
cd ../frontend
npm run lint

# 5. Build frontend
echo "→ Build frontend React..."
npm run build

# 6. Audit sécurité dépendances
echo "→ Audit npm backend..."
cd ../backend
npm audit --audit-level=moderate

echo "→ Audit npm frontend..."
cd ../frontend
npm audit --audit-level=moderate

# 7. Vérification secrets
echo "→ Vérification secrets..."
cd ..
if grep -r "change-me" backend/src/ --include="*.ts"; then
    echo "❌ ERREUR : Fallback 'change-me' trouvé dans le code !"
    exit 1
fi

# 8. Vérification Prisma schema
echo "→ Validation schema Prisma..."
cd backend
npx prisma validate

echo ""
echo "✅ Toutes les vérifications sont passées !"
echo "🚀 Prêt pour le déploiement."