# Vectura

Plateforme de mise en relation entre chauffeurs PL/SPL et entreprises de transport.

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- **Backend** : Node.js + Express + TypeScript + Prisma ORM
- **Base de données** : PostgreSQL 16 + Redis 7
- **Auth** : JWT (access + refresh tokens) + bcrypt
- **Upload** : Multer + stockage local (dev) / S3-compatible (prod)
- **Email** : Nodemailer + SMTP
- **Docker** : docker-compose (frontend + backend + postgres + redis)
- **Tests** : Vitest (frontend) + Jest (backend)

## Démarrage local

```bash
# Cloner le projet
git clone <repo-url>
cd vectura

# Copier les variables d'environnement
cp .env.example .env

# Démarrer les services
docker-compose up -d

# Installer les dépendances backend
cd backend && npm install
npm run prisma:generate
npm run prisma:migrate

# Installer les dépendances frontend
cd ../frontend && npm install
cd ..

# Démarrer en mode développement
# Backend : http://localhost:3000/api
# Frontend : http://localhost:5173
```

## Arrêt des services

```bash
docker-compose down
```

## Réinitialisation base de données

```bash
cd backend
npm run prisma:reset
```

## Architecture

```
vectura/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── prisma/
│   └── package.json
├── frontend/         # Application React
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   └── package.json
└── docker-compose.yml
```

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DB_PASSWORD` | Mot de passe PostgreSQL | - |
| `JWT_SECRET` | Secret pour les tokens JWT | - |
| `JWT_ACCESS_EXPIRATION` | Durée token accès | 15m |
| `JWT_REFRESH_EXPIRATION` | Durée token rafraîchissement | 7d |
| `SMTP_HOST` | Serveur SMTP | - |
| `SMTP_PORT` | Port SMTP | - |
| `SMTP_USER` | Utilisateur SMTP | - |
| `SMTP_PASS` | Mot de passe SMTP | - |
| `FROM_EMAIL` | Email expéditeur | - |
| `MATCHING_MAX_RADIUS_KM` | Rayon max géographique | 50 |
| `MIN_RATE_PL` | Tarif min PL (€/h) | 25 |
| `MIN_RATE_SPL` | Tarif min SPL (€/h) | 30 |
| `PLATFORM_MARGIN_PERCENT` | Marge plateforme (%) | 15 |
| `MAX_FILE_SIZE_MB` | Taille max upload | 10 |

## Scripts utiles

```bash
# Backend
npm run dev        # Développement
npm run build      # Build production
npm run lint       # Vérification ESLint
npm run typecheck  # Vérification TypeScript
npm test           # Tests unitaires

# Frontend
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

## CI/CD

Pipeline GitHub Actions configuré dans `.github/workflows/ci.yml` :
- Lint frontend & backend
- Tests unitaires
- Build des artefacts

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/register` - Inscription chauffeur
- `POST /api/login` - Connexion chauffeur
- `GET /api/missions` - Liste des missions (chauffeur)
- `POST /api/missions` - Création mission (entreprise)