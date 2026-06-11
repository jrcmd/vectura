# Setup - Vectura

## Prerequisites

- Docker & Docker Compose
- Node.js 20.x
- npm 10.x
- PostgreSQL 15+ (si dev sans Docker)
- Redis 7+ (si dev sans Docker)

## Installation complète

### 1. Cloner le projet

```bash
git clone <repository-url>
cd vectura
```

### 2. Variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 3. Démarrer avec Docker (recommandé)

```bash
docker-compose up -d
```

### 4. Installation des dépendances

```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate

# Frontend
cd ../frontend
npm install
```

### 5. Vérifier l'installation

```bash
# Health check
curl http://localhost:3000/api/health

# Frontend
open http://localhost:5173
```

## Développement sans Docker

### Backend

```bash
cd backend
npm install
npm run prisma:generate
# Configurer DATABASE_URL et REDIS_URL dans backend/.env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Structure des dossiers

```
vectura/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Entrée serveur
│   │   ├── routes/            # Routes Express
│   │   ├── controllers/       # Logique métier
│   │   ├── services/          # Services externes
│   │   ├── middleware/        # Middlewares custom
│   │   └── prisma/            # Client Prisma + seed
│   └── prisma/
│       └── schema.prisma      # Schéma DB
├── frontend/
│   ├── src/
│   │   ├── pages/             # Pages principales
│   │   ├── components/        # Composants réutilisables
│   │   ├── hooks/             # Hooks personnalisés
│   │   ├── services/          # API services
│   │   └── types/             # Types TypeScript
│   └── public/                # Assets statiques
├── DOCUMENTATION/
└── docker-compose.yml
```

## Première utilisation

1. Démarrer les services : `docker-compose up -d`
2. Vérifier les logs : `docker-compose logs -f`
3. Se connecter à la BDD : `psql postgresql://vectura:password@localhost:5432/vectura`
4. Accéder à Redis : `redis-cli -p 6379`