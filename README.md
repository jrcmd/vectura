# Vectura

Plateforme de mise en relation entre chauffeurs PL/SPL et entreprises de transport.

## Stack technique

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS
- **Backend** : Node.js + Express + TypeScript + Prisma ORM
- **Base de données** : PostgreSQL 15 + Redis 7
- **Auth** : JWT access + refresh tokens, hachage SHA-256 salé ; les anciens hachages bcrypt natifs sont rejetés pour éviter les crashes Alpine
- **Upload** : Multer + stockage local en dev, S3-compatible en production
- **Email** : Nodemailer + SMTP
- **SMS** : Twilio-ready via routes SMS
- **Docker** : Docker Compose avec frontend, backend, PostgreSQL et Redis
- **Tests** : Vitest côté frontend, Jest côté backend

## Démarrage local

```bash
# Cloner le projet
git clone <repo-url>
cd vectura

# Copier les variables d'environnement
cp .env.example .env

# Démarrer la stack Docker
docker compose up -d --build backend frontend

# Appliquer les migrations et injecter les données de test
docker compose exec -T backend npm run prisma:seed
```

URLs :

- Frontend : http://localhost:5173
- Backend API : http://localhost:3000/api
- Health backend : http://localhost:3000/api/health

Compte admin de test après seed :

- Email : `admin@vectura.fr`
- Mot de passe : `password123`

## Arrêt et réinitialisation

```bash
# Arrêter la stack
docker compose down

# Réinitialiser complètement la base, les volumes et les seeds
docker compose down -v
docker compose up -d --build backend frontend
docker compose exec -T backend npm run prisma:seed
```

## Architecture

```text
vectura/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   └── pages/
│   ├── Dockerfile
│   └── package.json
├── scripts/                   # Scripts déploiement & ops
│   ├── generate-secrets.sh
│   ├── pre-deploy-check.sh
│   ├── deploy-staging.sh
│   ├── deploy-production.sh
│   ├── backup.sh
│   └── ...
├── nginx-conf/                # Configuration Nginx
│   ├── nginx.conf
│   ├── api.vectura.fr
│   └── app.vectura.fr
├── docker-compose.yml         # développement local
├── docker-compose.staging.yml # préproduction
├── docker-compose.prod.yml    # production
├── .env.example
├── .env.staging.example
└── .env.production.example
```

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DB_PASSWORD` | Mot de passe PostgreSQL Docker | `password` |
| `DATABASE_URL` | URL complète PostgreSQL | `postgresql://vectura:password@localhost:5432/vectura` |
| `REDIS_URL` | URL Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Secret JWT | - |
| `JWT_ACCESS_EXPIRATION` | Durée token d'accès | `15m` |
| `JWT_REFRESH_EXPIRATION` | Durée token de rafraîchissement | `7d` |
| `SMTP_HOST` | Serveur SMTP | - |
| `SMTP_PORT` | Port SMTP | - |
| `SMTP_USER` | Utilisateur SMTP | - |
| `SMTP_PASS` | Mot de passe SMTP | - |
| `FROM_EMAIL` | Email expéditeur | - |
| `MATCHING_MAX_RADIUS_KM` | Rayon max géographique | `50` |
| `MIN_RATE_PL` | Tarif min PL €/h | `25` |
| `MIN_RATE_SPL` | Tarif min SPL €/h | `30` |
| `PLATFORM_MARGIN_PERCENT` | Marge plateforme % | `15` |
| `MAX_FILE_SIZE_MB` | Taille max upload | `10` |
| `UPLOAD_DIR` | Dossier uploads | `./uploads` |
| `INVOICE_DIR` | Dossier factures | `./uploads/invoices` |
| `BACKUP_DIR` | Dossier sauvegardes | `./backups` |
| `BACKUP_ENABLED` | Active les sauvegardes | `true` |
| `BACKUP_USE_METADATA_ONLY` | Sauvegarde métadonnées uniquement | `false` |
| `DOMAIN` | Domaine applicatif | `localhost` |
| `SSL_MODE` | Mode SSL externe ou intégré | `external` |
| `API_BASE_URL` | URL backend côté serveur | `http://localhost:3000/api` |
| `FRONTEND_BASE_URL` | URL frontend côté serveur | `http://localhost:5173` |
| `VITE_API_URL` | URL API côté frontend | `http://localhost:3000/api` |
| `NODE_ENV` | Environnement runtime | `development` |

## Scripts utiles

Scripts de gestion disponibles dans `scripts/` :

### Développement
```bash
./scripts/generate-secrets.sh    # Générer les secrets JWT, DB, backup
./scripts/smoke-tests.sh         # Tests de fumée post-déploiement
./scripts/seed-staging.sh        # Injection données test en staging
```

### Pré-déploiement
```bash
./scripts/pre-deploy-check.sh    # Vérifications lint/test/audit
./scripts/pre-deploy-backup.sh   # Backup avant déploiement
```

### Déploiement
```bash
./scripts/deploy-staging.sh <branch>    # Déploiement staging
./scripts/deploy-production.sh <tag>  # Déploiement production
./scripts/rollback.sh <backup_name>   # Rollback en cas d'échec
```

### Production & Monitoring
```bash
./scripts/setup-server.sh         # Installation serveur (Ubuntu)
./scripts/setup-nginx.sh          # Configuration Nginx + SSL
./scripts/backup.sh               # Sauvegarde DB chiffrée
./scripts/restore.sh <file.gpg>   # Restauration depuis backup
./scripts/monitoring.sh           # Dashboard métriques
./scripts/alerting.sh             # Alerting (cron)
./scripts/cleanup-logs.sh         # Nettoyage logs
./scripts/verify-backups.sh       # Vérification intégrité backups
./scripts/weekly-report.sh        # Rapport hebdomadaire
```

## Docker Compose

Fichiers disponibles :

- `docker-compose.yml` : développement local
- `docker-compose.staging.yml` : préproduction
- `docker-compose.prod.yml` : production

Commandes de validation :

```bash
docker compose config
docker compose -f docker-compose.staging.yml config
docker compose -f docker-compose.prod.yml config
```

Le backend applique automatiquement `prisma migrate deploy` au démarrage Docker. Les seeds ne sont pas exécutés automatiquement afin d'éviter d'écraser des données existantes en local.

## CI/CD

Pipeline GitHub Actions configuré dans `.github/workflows/ci.yml` :

- lint frontend
- lint backend
- tests unitaires
- build frontend
- build backend

## QA, audit et monitoring Epic 9

Pages frontend ajoutées :

- QA fonctionnelle : `frontend/src/pages/QaFunctional.tsx`
- QA sécurité : `frontend/src/pages/QaSecurity.tsx`
- Préproduction : `frontend/src/pages/Preproduction.tsx`
- Production : `frontend/src/pages/Production.tsx`
- Stabilisation : `frontend/src/pages/Stabilization.tsx`

Endpoints admin associés :

- `GET /api/qa/functional`
- `GET /api/qa/security`
- `GET /api/qa/preprod`
- `GET /api/qa/preproduction`
- `GET /api/qa/production`
- `GET /api/qa/stabilization`
- `GET /api/qa/summary`
- `POST /api/qa/checks`
- `PATCH /api/qa/checks/:suite/:name`
- `GET /api/qa/checks`
- `POST /api/qa/seed`

Audit, incidents et monitoring :

- `GET /api/admin/audit/events`
- `GET /api/admin/audit/incidents`
- `POST /api/admin/audit/incidents`
- `PATCH /api/admin/audit/incidents/:id/resolve`
- `GET /api/admin/monitoring/production`
- `GET /api/admin/monitoring/jobs`
- `PATCH /api/admin/monitoring/jobs/:name`
- `POST /api/admin/monitoring/jobs/:name/run`
- `GET /api/admin/monitoring/backups`
- `POST /api/admin/monitoring/backups/run`
- `GET /api/admin/monitoring/mail`
- `GET /api/monitoring/health`

## API Endpoints principaux

- `GET /api/health` - Health check
- `POST /api/drivers/register` - Inscription chauffeur
- `POST /api/companies/register` - Inscription entreprise
- `POST /api/auth/login` - Connexion chauffeur
- `POST /api/companies/login` - Connexion entreprise
- `POST /api/documents/upload` - Upload document chauffeur
- `GET /api/driver/missions` - Missions compatibles chauffeur
- `POST /api/companies/missions` - Création mission entreprise
- `GET /api/admin/kpis` - KPI back office
- `PATCH /api/admin/documents/validate` - Validation document admin
- `PATCH /api/admin/documents/reject` - Rejet document admin
- `GET /api/billing/invoices` - Factures chauffeur
- `GET /api/billing/invoices/:id/csv` - Export CSV chauffeur
- `GET /api/billing/invoices/:id/excel` - Export Excel chauffeur
- `GET /api/companies/billing/invoices` - Factures entreprise
- `GET /api/admin/billing/export/csv` - Export comptable admin
- `POST /api/sms/send` - Envoi SMS via Twilio
- `GET /api/qa/functional` - Résumé des parcours fonctionnels QA
- `GET /api/qa/security` - Résumé des contrôles sécurité QA
- `GET /api/admin/audit/events` - Journal des événements sécurité
- `GET /api/admin/audit/incidents` - Incidents post-lancement
- `GET /api/admin/monitoring/jobs` - État des cron jobs
- `POST /api/admin/monitoring/backups/run` - Lance une sauvegarde
- `GET /api/admin/monitoring/production` - Pré-check production

## Validation réalisée

Dernière validation locale :

```bash
cd backend && npm run type-check && npm run lint && npm test
cd frontend && npm run build
docker compose up -d --build backend frontend
docker compose exec -T backend npm run prisma:seed
docker compose config
docker compose -f docker-compose.staging.yml config
docker compose -f docker-compose.prod.yml config
curl -fsS http://localhost:3000/api/health
curl -fsS http://localhost:5173/
```

État observé après validation :

- backend healthy sur `localhost:3000`
- frontend healthy sur `localhost:5173`
- PostgreSQL et Redis running
- tests backend passés
- endpoints QA, audit et monitoring accessibles avec token admin
