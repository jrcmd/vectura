# Commandes rapides - Vectura

## Développement local

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Arrêter et nettoyer les volumes
docker-compose down -v

# Voir les logs (tous services)
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Base de données

```bash
# Générer le client Prisma
cd backend && npm run prisma:generate

# Appliquer les migrations
cd backend && npm run prisma:migrate

# Seed (données de test)
cd backend && npm run prisma:seed

# Reset complet de la base
cd backend && npx prisma db push --force-reset
```

## Frontend

```bash
# Installation dépendances
cd frontend && npm install

# Développement
cd frontend && npm run dev

# Build production
cd frontend && npm run build

# Preview du build
cd frontend && npm run preview

# Lint
cd frontend && npm run lint

# Tests
cd frontend && npm run test
```

## Backend

```bash
# Installation dépendances
cd backend && npm install

# Développement (hot reload)
cd backend && npm run dev

# Build
cd backend && npm run build

# Lint
cd backend && npm run lint

# Type-check
cd backend && npm run type-check

# Tests
cd backend && npm run test
```

## Git

```bash
# Conventions de branches
git checkout -b feature/ma-fonctionnalite
git checkout -b hotfix/mon-bug

# Commit (pré-commit hook vérifie lint + typecheck)
git add .
git commit -m "feat: description claire"

# Push
git push origin feature/ma-fonctionnalite
```

## CI/CD

```bash
# Vérifier la pipeline localement
npx act -j lint
npx act -j test
npx act -j build
```