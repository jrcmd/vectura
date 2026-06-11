# Configuration - Vectura

## Variables d'environnement (.env)

### Base de données

| Variable | Exemple | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://vectura:password@localhost:5432/vectura` | URL de connexion PostgreSQL |
| `REDIS_URL` | `redis://localhost:6379` | URL de connexion Redis |

### Authentification

| Variable | Exemple | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `your-super-secret-jwt-key-min-32-chars` | Secret pour signer les tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRATION` | `15m` | Durée du token d'accès |
| `JWT_REFRESH_EXPIRATION` | `7d` | Durée du token de rafraîchissement |

### Email (SMTP)

| Variable | Exemple | Description |
|----------|---------|-------------|
| `SMTP_HOST` | `smtp.sendgrid.net` | Hôte SMTP |
| `SMTP_PORT` | `587` | Port SMTP |
| `SMTP_USER` | `apikey` | Utilisateur SMTP |
| `SMTP_PASS` | `your-sendgrid-api-key` | Mot de passe/API key SMTP |
| `FROM_EMAIL` | `noreply@vectura.fr` | Adresse expéditeur |

### Tarification

| Variable | Exemple | Description |
|----------|---------|-------------|
| `MIN_RATE_PL` | `25` | Tarif minimum PL (€/heure) |
| `MIN_RATE_SPL` | `30` | Tarif minimum SPL (€/heure) |
| `PLATFORM_MARGIN_PERCENT` | `15` | Marge plateforme sur les missions (%) |

### Matching géographique

| Variable | Exemple | Description |
|----------|---------|-------------|
| `MATCHING_MAX_RADIUS_KM` | `50` | Rayon max en km pour le matching (À CONFIRMER si valeur OK) |

### Uploads

| Variable | Exemple | Description |
|----------|---------|-------------|
| `MAX_FILE_SIZE_MB` | `10` | Taille max fichier upload (MB) |
| `UPLOAD_DIR` | `./uploads` | Dossier stockage local |

### Frontend

| Variable | Exemple | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` | URL de l'API backend |

## docker-compose.yml

Services :
- `postgres` : PostgreSQL 15-alpine (port 5432)
- `redis` : Redis 7-alpine (port 6379)
- `backend` : API sur port 3000
- `frontend` : Interface sur port 5173

Volumes persistants :
- `postgres_data` : Données PostgreSQL
- `./uploads` : Fichiers uploadés

Réseau Docker :
- Communication interne via `postgres:5432`, `redis:6379`

## Ports par défaut

| Service | Port interne | Port exposé |
|---------|--------------|-------------|
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| Backend | 3000 | 3000 |
| Frontend | 5173 | 5173 |