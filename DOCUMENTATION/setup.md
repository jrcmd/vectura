# Setup - Vectura

## Prerequisites

- Docker & Docker Compose
- Node.js 20.x
- npm 10.x
- PostgreSQL 15+ (si dev sans Docker)
- Redis 7+ (si dev sans Docker)

## Scripts disponibles

Tous les scripts de déploiement et opérations sont dans le répertoire `scripts/` :

| Script | Description | Usage |
|--------|-------------|-------|
| `generate-secrets.sh` | Génère JWT_SECRET, DB_PASSWORD, BACKUP_KEY | `./scripts/generate-secrets.sh` |
| `pre-deploy-check.sh` | Lint, tests, audit, validation Prisma | `./scripts/pre-deploy-check.sh` |
| `deploy-staging.sh` | Déploiement sur environnement staging | `./scripts/deploy-staging.sh develop` |
| `deploy-production.sh` | Déploiement production avec backup | `./scripts/deploy-production.sh v1.0.0` |
| `backup.sh` | Sauvegarde PostgreSQL chiffrée GPG | (via cron) |
| `restore.sh` | Restauration depuis backup | `./scripts/restore.sh backup.gpg` |
| `rollback.sh` | Retour en arrière après échec | `./scripts/rollback.sh pre-deploy-xxx` |
| `smoke-tests.sh` | Tests de fumée post-déploiement | `./scripts/smoke-tests.sh https://api.vectura.fr` |
| `monitoring.sh` | Dashboard métriques système | `./scripts/monitoring.sh` |
| `alerting.sh` | Alerting basique (cron 5min) | (via cron) |

Configuration Nginx dans `nginx-conf/` : `nginx.conf`, `api.vectura.fr`, `app.vectura.fr`.

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
├── scripts/                   # Scripts déploiement & ops
│   ├── generate-secrets.sh    # Génération secrets prod
│   ├── pre-deploy-check.sh    # Vérif lint/test/audit
│   ├── deploy-staging.sh      # Déploiement staging
│   ├── deploy-production.sh   # Déploiement production
│   ├── backup.sh              # Sauvegarde DB GPG
│   ├── restore.sh             # Restauration backup
│   ├── rollback.sh            # Retour en arrière
│   └── monitoring.sh          # Dashboard métriques
├── nginx-conf/                # Configuration Nginx
│   ├── nginx.conf             # Config principale
│   ├── api.vectura.fr         # Reverse proxy API
│   └── app.vectura.fr         # Frontend SPA
├── DOCUMENTATION/
└── docker-compose.yml
```

## Première utilisation

1. Démarrer les services : `docker-compose up -d`
2. Vérifier les logs : `docker-compose logs -f`
3. Se connecter à la BDD : `psql postgresql://vectura:password@localhost:5432/vectura`
4. Accéder à Redis : `redis-cli -p 6379`

# 🚀 PLAN DE MISE EN PRODUCTION — VECTURA MVP

> **Version** : 1.0  
> **Date** : 12 Juin 2026  
> **Auteur** : Équipe Vectura  
> **Statut** : Prêt pour déploiement  

---

## 📋 TABLE DES MATIÈRES

1. [Pré-requis & Checklist Pré-Déploiement](#phase-0)
2. [Préparation de l'Infrastructure](#phase-1)
3. [Déploiement Staging](#phase-2)
4. [Déploiement Production](#phase-3)
5. [Validation & Monitoring](#phase-4)
6. [Stabilisation & Optimisation](#phase-5)
7. [Annexes](#annexes)

---

## PHASE 0 : PRÉ-REQUIS & CHECKLIST PRÉ-DÉPLOIEMENT

### 0.1 Vérifications Techniques Préalables

Avant toute mise en production, assure-toi que les 10 priorités critiques de l'audit sont corrigées :

| # | Vérification | Critère de succès | Commande de test |
|---|-------------|-------------------|------------------|
| 1 | `JWT_SECRET` robuste (≥64 caractères, aléatoire) | Pas de fallback `change-me` | `grep -r "change-me" backend/src/` doit être vide |
| 2 | Rate limiting activé | HTTP 429 après 5 tentatives auth | `for i in {1..6}; do curl -X POST api/auth/login; done` |
| 3 | Matching optimisé | Temps réponse < 200ms pour 1000 missions | `curl -w "@curl-format.txt" api/driver/missions` |
| 4 | Index DB créés | `EXPLAIN` montre des Index Scans | `EXPLAIN SELECT * FROM "Mission" WHERE status = 'OUVERTE';` |
| 5 | Dockerfile non-root | Container s'exécute avec UID 1001 | `docker exec vectura-backend id` → `uid=1001(appuser)` |
| 6 | Uploads sécurisés | Fichier `.exe` renommé `.pdf` rejeté | Test d'upload avec faux PDF |
| 7 | Auth centralisée | Un seul middleware JWT | `grep -r "verify.*jwt" backend/src/middleware/ | wc -l` = 1 |
| 8 | Retry notifications | Échec réessayé 3x puis marqué FAILED | Vérifier `NotificationLog` après coupure SMTP |
| 9 | Backup externe | Dumps chiffrés hors conteneur | `ls /backups/*.gpg` |
| 10 | Tests passent | Couverture > 70%, 0 échec | `npm run test:ci` |

### 0.2 Génération des Secrets de Production

```bash
#!/bin/bash
# scripts/generate-secrets.sh

echo "=== Génération des secrets de production Vectura ==="

# JWT_SECRET (64 bytes = 512 bits)
JWT_SECRET=$(openssl rand -base64 64)
echo "JWT_SECRET=${JWT_SECRET}"

# REFRESH_TOKEN_SECRET
REFRESH_SECRET=$(openssl rand -base64 64)
echo "REFRESH_TOKEN_SECRET=${REFRESH_SECRET}"

# PostgreSQL mot de passe
DB_PASSWORD=$(openssl rand -base64 32 | tr -d /=+ | cut -c1-24)
echo "DB_PASSWORD=${DB_PASSWORD}"

# Clé de chiffrement backups
BACKUP_KEY=$(openssl rand -base64 32)
echo "BACKUP_ENCRYPTION_KEY=${BACKUP_KEY}"

echo ""
echo "⚠️  COPIER CES VALEURS DANS VOTRE .env.production ET VAULT"
echo "⚠️  NE JAMAIS COMMITTER CE FICHIER"
```

### 0.3 Structure du `.env.production`

```bash
# ============================================
# VECTURA — CONFIGURATION PRODUCTION
# ============================================

# --- Application ---
NODE_ENV=production
PORT=3000
APP_URL=https://api.vectura.fr
FRONTEND_URL=https://app.vectura.fr

# --- Base de données ---
DATABASE_URL=postgresql://vectura:${DB_PASSWORD}@postgres:5432/vectura_prod?schema=public&connection_limit=20&pool_timeout=30

# --- Cache & Sessions ---
REDIS_URL=redis://redis:6379

# --- Sécurité JWT ---
# MINIMUM 64 caractères base64, généré via openssl rand -base64 64
JWT_SECRET=changez_moi_immediatement_via_le_script_generate_secrets.sh
REFRESH_TOKEN_SECRET=changez_moi_aussi_immediatement
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d

# --- CORS ---
# UNIQUEMENT les domaines de production
CORS_ORIGIN=https://app.vectura.fr

# --- SMTP / Notifications ---
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@vectura.fr
SMTP_FROM_NAME=Vectura

# --- Tarification ---
MIN_RATE_PL=25.00
MIN_RATE_SPL=30.00

# --- Fichiers ---
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/app/uploads
BACKUP_DIR=/backups
BACKUP_ENCRYPTION_KEY=changez_moi_via_script

# --- Géocodage ---
GEO_PROVIDER=openstreetmap
GEO_API_KEY=
MAX_DISTANCE_KM=50

# --- Logging ---
LOG_LEVEL=info
LOG_FORMAT=json
```

### 0.4 Tests Finaux Avant Déploiement

```bash
#!/bin/bash
# scripts/pre-deploy-check.sh

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
```

---

## PHASE 1 : PRÉPARATION DE L'INFRASTRUCTURE

### 1.1 Provisionnement Serveur Cloud

#### Recommandations Hardware

| Service | Configuration Minimale | Recommandée | Provider |
|---------|---------------------|-------------|----------|
| Application (Backend + Frontend) | 2 vCPU, 4GB RAM, 50GB SSD | 4 vCPU, 8GB RAM, 100GB SSD | Hetzner CX42 / DO Droplet |
| PostgreSQL (Managed ou auto-hébergé) | 1 vCPU, 2GB RAM, 50GB SSD | 2 vCPU, 4GB RAM, 100GB SSD | Scaleway RDS / DO Managed DB |

#### Installation Système (Ubuntu 22.04 LTS)

```bash
#!/bin/bash
# scripts/setup-server.sh

set -e

SERVER_IP="${1:-VOTRE_IP}"
SSH_KEY="${2:-~/.ssh/id_rsa.pub}"

echo "=== Configuration serveur Vectura (${SERVER_IP}) ==="

# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Outils essentiels
sudo apt install -y curl wget git vim htop net-tools ufw fail2ban

# Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installé"
fi

# Docker Compose
sudo apt install -y docker-compose-plugin

# Nginx
sudo apt install -y nginx

# Certbot (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx

# Node.js (pour outils CLI si besoin)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (gestion process Node.js)
sudo npm install -g pm2

# Configuration UFW (Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 3000/tcp  # API interne (si pas via Nginx)
sudo ufw --force enable

echo "✅ Serveur configuré. Déconnectez-vous et reconnectez-vous pour Docker."
```

### 1.2 Configuration Nginx (Reverse Proxy + SSL)

#### Fichier Principal : `/etc/nginx/nginx.conf`

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Logs
    log_format vectura '$remote_addr - $remote_user [$time_local] '
                      '"$request" $status $body_bytes_sent '
                      '"$http_referer" "$http_user_agent" '
                      '$request_time $upstream_response_time';

    access_log /var/log/nginx/access.log vectura;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

#### Configuration API : `/etc/nginx/sites-available/api.vectura.fr`

```nginx
server {
    listen 80;
    server_name api.vectura.fr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.vectura.fr;

    # SSL Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/api.vectura.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.vectura.fr/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/api.vectura.fr/chain.pem;

    # SSL Hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.vectura.fr;" always;

    # Rate limiting sur auth
    location /api/auth/ {
        limit_req zone=auth_limit burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API générale
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Uploads (plus permissif en taille)
    location /api/documents/upload {
        client_max_body_size 10M;
        proxy_pass http://localhost:3000;
    }
}
```

#### Configuration Frontend : `/etc/nginx/sites-available/app.vectura.fr`

```nginx
server {
    listen 80;
    server_name app.vectura.fr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.vectura.fr;

    ssl_certificate /etc/letsencrypt/live/app.vectura.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.vectura.fr/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/app.vectura.fr/chain.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /var/www/vectura-frontend;
    index index.html;

    # Cache assets statiques (React build)
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Cache fichiers avec hash
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 6M;
        add_header Cache-Control "public, immutable";
    }

    # SPA React — tout redirige vers index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Page d'erreur maintenance
    error_page 503 /maintenance.html;
    location = /maintenance.html {
        root /var/www/vectura-frontend;
        internal;
    }
}
```

#### Activation et SSL

```bash
#!/bin/bash
# scripts/setup-nginx.sh

set -e

echo "=== Configuration Nginx + SSL ==="

# Créer les liens symboliques
sudo ln -sf /etc/nginx/sites-available/api.vectura.fr /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/app.vectura.fr /etc/nginx/sites-enabled/

# Supprimer le default
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Redémarrage Nginx
sudo systemctl restart nginx

# SSL Let's Encrypt (mode standalone temporairement)
sudo certbot --nginx -d api.vectura.fr -d app.vectura.fr --non-interactive --agree-tos --email admin@vectura.fr

# Auto-renewal cron
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ Nginx configuré avec SSL"
```

### 1.3 Docker Compose Production

#### Fichier : `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  # ============================================
  # POSTGRESQL — Base de données
  # ============================================
  postgres:
    image: postgres:15-alpine
    container_name: vectura-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: vectura_prod
      POSTGRES_USER: ${DB_USER:-vectura}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups:rw
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
    networks:
      - vectura-network
    ports:
      - "127.0.0.1:5432:5432"  # Uniquement localhost, pas exposé publiquement
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-vectura} -d vectura_prod"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # ============================================
  # REDIS — Cache & Sessions
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: vectura-redis
    restart: unless-stopped
    command: >
      redis-server
      --appendonly yes
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis_data:/data
    networks:
      - vectura-network
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  # ============================================
  # BACKEND — API Node.js/Express
  # ============================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    container_name: vectura-backend
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - uploads:/app/uploads:rw
      - ./backups:/app/backups:rw
      - backend_logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - vectura-network
    # Pas de ports exposés publiquement — passe par Nginx
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  # ============================================
  # BACKUP — Service de sauvegarde automatique
  # ============================================
  backup:
    image: postgres:15-alpine
    container_name: vectura-backup
    restart: unless-stopped
    environment:
      - PGPASSWORD=${DB_PASSWORD}
      - DB_USER=${DB_USER:-vectura}
      - DB_NAME=vectura_prod
      - BACKUP_DIR=/backups
      - BACKUP_ENCRYPTION_KEY=${BACKUP_ENCRYPTION_KEY}
    volumes:
      - ./backups:/backups:rw
      - ./scripts:/scripts:ro
    networks:
      - vectura-network
    depends_on:
      - postgres
    command: >
      sh -c "
        echo '0 3 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1' | crontab - &&
        crond -f -l 2
      "
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M

networks:
  vectura-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads:
    driver: local
  backend_logs:
    driver: local
```

### 1.4 Dockerfile Backend (Non-Root)

#### Fichier : `backend/Dockerfile`

```dockerfile
# ============================================
# VECTURA BACKEND — Dockerfile Production
# ============================================

FROM node:20-alpine AS builder

# Dépendances de build
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm ci --only=production && npm cache clean --force

# Génération du client Prisma
RUN npx prisma generate

# Étape de production
FROM node:20-alpine AS production

# Installation des dépendances runtime
RUN apk add --no-cache curl wget ca-certificates

# Création utilisateur non-root
RUN addgroup -g 1001 -S appgroup &&     adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copie des dépendances depuis builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copie du code compilé
COPY dist ./dist

# Création des répertoires avec bonnes permissions
RUN mkdir -p /app/uploads /app/backups /app/logs &&     chown -R appuser:appgroup /app

# Passage en non-root
USER appuser

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3     CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Port exposé (documentaire)
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/server.js"]
```

### 1.5 Scripts de Sauvegarde Automatisée

#### Script Principal : `scripts/backup.sh`

```bash
#!/bin/bash
# scripts/backup.sh — Sauvegarde chiffrée PostgreSQL

set -e

# Configuration
DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-vectura}"
DB_NAME="${DB_NAME:-vectura_prod}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/vectura_backup_${TIMESTAMP}.sql"

# Vérification de la clé de chiffrement
if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
    echo "❌ ERREUR : BACKUP_ENCRYPTION_KEY non définie"
    exit 1
fi

echo "=== Backup Vectura — ${TIMESTAMP} ==="

# Création du backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"     --clean --if-exists --create     --no-owner --no-privileges     > "$BACKUP_FILE"

echo "✅ Backup créé : ${BACKUP_FILE}"

# Compression
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup compressé : ${BACKUP_FILE}"

# Chiffrement GPG
gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY"     --symmetric --cipher-algo AES256     --output "${BACKUP_FILE}.gpg"     "$BACKUP_FILE"

# Suppression du fichier non chiffré
rm "$BACKUP_FILE"

echo "✅ Backup chiffré : ${BACKUP_FILE}.gpg"

# Vérification du backup
gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY"     --decrypt "${BACKUP_FILE}.gpg" | head -c 100 > /dev/null

echo "✅ Vérification du backup OK"

# Nettoyage des anciens backups
find "$BACKUP_DIR" -name "vectura_backup_*.gpg" -mtime +$RETENTION_DAYS -delete

echo "✅ Nettoyage des backups de +${RETENTION_DAYS} jours effectué"

# Statistiques
BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gpg" | cut -f1)
echo "📊 Taille du backup : ${BACKUP_SIZE}"
echo "=== Backup terminé avec succès ==="
```

#### Script de Restauration : `scripts/restore.sh`

```bash
#!/bin/bash
# scripts/restore.sh — Restauration d'un backup

set -e

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-postgres}"
DB_USER="${DB_USER:-vectura}"
DB_NAME="${DB_NAME:-vectura_prod}"
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <fichier_backup.gpg>"
    echo "Backups disponibles :"
    ls -lah /backups/*.gpg 2>/dev/null || echo "Aucun backup trouvé"
    exit 1
fi

if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
    echo "❌ ERREUR : BACKUP_ENCRYPTION_KEY non définie"
    exit 1
fi

echo "⚠️  RESTAURATION — Cette opération va ÉCRASER la base ${DB_NAME}"
read -p "Êtes-vous sûr ? (tapez 'OUI' pour confirmer) : " CONFIRM

if [ "$CONFIRM" != "OUI" ]; then
    echo "❌ Restauration annulée"
    exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== Restauration Vectura — ${TIMESTAMP} ==="

# Backup de sécurité avant restauration
echo "→ Création d'un backup de sécurité..."
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | gzip > "/backups/pre-restore-${TIMESTAMP}.sql.gz"

# Déchiffrement
echo "→ Déchiffrement du backup..."
gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY"     --decrypt "$BACKUP_FILE" > "/tmp/restore_${TIMESTAMP}.sql.gz"

# Restauration
echo "→ Restauration de la base..."
gunzip -c "/tmp/restore_${TIMESTAMP}.sql.gz" | psql -h "$DB_HOST" -U "$DB_USER" -d postgres

# Nettoyage
rm "/tmp/restore_${TIMESTAMP}.sql.gz"

echo "✅ Restauration terminée avec succès"
echo "⚠️  Vérifiez les données et redémarrez les services si nécessaire"
```

---

## PHASE 2 : DÉPLOIEMENT STAGING

### 2.1 Préparation de l'Environnement Staging

```bash
#!/bin/bash
# scripts/deploy-staging.sh

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
```

### 2.2 Tests de Recette Staging

#### Script de Tests Automatisés : `scripts/smoke-tests.sh`

```bash
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
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register-driver"     -H "Content-Type: application/json"     -d '{"email":"test@staging.vectura","password":"Test1234!","firstName":"Test","lastName":"Staging","phone":"+33612345678","city":"Paris"}')

echo "$REGISTER_RESPONSE" | grep -q "id" || (echo "❌ Inscription chauffeur KO"; exit 1)
echo "✅ Inscription chauffeur OK"

# Test 6 : Connexion
echo "→ Test 6 : Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login"     -H "Content-Type: application/json"     -d '{"email":"test@staging.vectura","password":"Test1234!"}')

echo "$LOGIN_RESPONSE" | grep -q "accessToken" || (echo "❌ Login KO"; exit 1)
echo "✅ Connexion OK"

# Test 7 : SSL
echo "→ Test 7 : SSL..."
SSL_DAYS=$(echo | openssl s_client -servername api.vectura.fr -connect api.vectura.fr:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
echo "✅ SSL valide jusqu'au ${SSL_DAYS}"

echo ""
echo "🎉 Tous les smoke tests sont passés !"
```

### 2.3 Injection de Données de Test

```bash
#!/bin/bash
# scripts/seed-staging.sh

cd backend

npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
    // Créer un admin
    await prisma.user.create({
        data: {
            email: 'admin@staging.vectura',
            password: 'hashed_password',
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'Staging',
            status: 'ACTIF'
        }
    });

    // Créer des chauffeurs de test
    for (let i = 1; i <= 10; i++) {
        await prisma.driver.create({
            data: {
                email: "chauffeur\${i}@staging.vectura",
                firstName: "Chauffeur",
                lastName: "Test\${i}",
                phone: "+3360000000\${i}",
                city: ['Paris', 'Lyon', 'Marseille', 'Bordeaux'][i % 4],
                status: 'VALIDE',
                licenseCategories: ['C', 'CE'],
                hasADR: i % 3 === 0,
                hasFrigo: i % 4 === 0
            }
        });
    }

    // Créer des entreprises de test
    for (let i = 1; i <= 5; i++) {
        await prisma.company.create({
            data: {
                email: "entreprise\${i}@staging.vectura",
                name: "Transport Test \${i}",
                siret: "1234567890001\${i}",
                city: ['Paris', 'Lyon', 'Marseille'][i % 3],
                status: 'ACTIF'
            }
        });
    }

    console.log('✅ Données de test injectées');
}

seed()
    .catch(console.error)
    .finally(() => prisma.\$disconnect());
"
```

---

## PHASE 3 : DÉPLOIEMENT PRODUCTION

### 3.1 Fenêtre de Maintenance

```
📅 RECOMMANDATION : Dimanche 02:00 - 06:00 CET
⏱️  DURÉE ESTIMÉE : 2 à 4 heures
📢 COMMUNICATION :
   - Email aux inscrits 48h avant
   - Bannière maintenance sur l'app 24h avant
   - Status page : https://status.vectura.fr
```

### 3.2 Backup Pré-Déploiement

```bash
#!/bin/bash
# scripts/pre-deploy-backup.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="pre-deploy-${TIMESTAMP}"

echo "=== Backup pré-déploiement ==="

# Backup base de données
docker exec vectura-postgres pg_dump -U vectura -d vectura_prod | gzip > "/backups/${BACKUP_NAME}.sql.gz"

# Backup uploads
tar -czf "/backups/${BACKUP_NAME}-uploads.tar.gz" /var/lib/docker/volumes/vectura_uploads/

# Backup configuration
tar -czf "/backups/${BACKUP_NAME}-config.tar.gz" /opt/vectura/.env.production /opt/vectura/docker-compose.prod.yml /etc/nginx/

# Vérification
ls -lah "/backups/${BACKUP_NAME}"*

echo "✅ Backup pré-déploiement créé : ${BACKUP_NAME}"
```

### 3.3 Déploiement Zero-Downtime (Blue/Green)

```bash
#!/bin/bash
# scripts/deploy-production.sh

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
```

### 3.4 Vérifications Post-Déploiement

```bash
#!/bin/bash
# scripts/post-deploy-check.sh

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
```

### 3.5 Plan de Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

BACKUP_NAME="${1:-DERNIER_BACKUP}"

echo "=== ROLLBACK VECTURA ==="
echo "⚠️  Cette opération va restaurer l'état précédent"
echo "→ Backup de restauration : ${BACKUP_NAME}"

read -p "Confirmer le rollback ? (OUI) : " CONFIRM
[ "$CONFIRM" != "OUI" ] && echo "Annulé" && exit 1

# 1. Mode maintenance
echo "→ Activation mode maintenance..."
sudo cp /var/www/vectura-frontend/maintenance.html /var/www/vectura-frontend/index.html

# 2. Arrêt des services
echo "→ Arrêt des services..."
docker-compose -f docker-compose.prod.yml down

# 3. Restauration base de données
echo "→ Restauration DB..."
if [ -f "/backups/${BACKUP_NAME}.sql.gz" ]; then
    gunzip -c "/backups/${BACKUP_NAME}.sql.gz" | docker exec -i vectura-postgres psql -U vectura -d postgres
else
    echo "❌ Backup DB non trouvé : /backups/${BACKUP_NAME}.sql.gz"
    exit 1
fi

# 4. Restauration uploads
echo "→ Restauration uploads..."
if [ -f "/backups/${BACKUP_NAME}-uploads.tar.gz" ]; then
    tar -xzf "/backups/${BACKUP_NAME}-uploads.tar.gz" -C /
fi

# 5. Checkout version précédente
echo "→ Restauration code..."
git log --oneline -5
git checkout HEAD~1  # Ou tag précédent

# 6. Redémarrage
echo "→ Redémarrage..."
docker-compose -f docker-compose.prod.yml up -d --build

# 7. Vérification
echo "→ Vérification..."
sleep 10
curl -sf http://localhost:3000/health && echo "✅ Rollback OK" || echo "❌ Rollback KO — intervention manuelle requise"

# 8. Désactivation maintenance
sudo rm -f /var/www/vectura-frontend/index.html
sudo cp /var/www/vectura-frontend/index.html.bak /var/www/vectura-frontend/index.html 2>/dev/null || true

echo "✅ Rollback terminé"
```

---

## PHASE 4 : VALIDATION & MONITORING

### 4.1 Monitoring Initial (Jour J à J+7)

#### Dashboard de Commandes

```bash
#!/bin/bash
# scripts/monitoring.sh

echo "=== Monitoring Vectura ==="
echo "$(date)"
echo ""

# Métriques système
echo "--- Système ---"
echo "CPU : $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM : $(free -m | awk 'NR==2{printf "%.1f%% (%s/%sMB)", $3*100/$2, $3, $2 }')"
echo "Disque : $(df -h / | awk 'NR==2{print $5}')"

# Conteneurs
echo ""
echo "--- Conteneurs ---"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Requêtes HTTP (depuis logs Nginx)
echo ""
echo "--- Trafic (dernière heure) ---"
sudo awk -v d1="$(date -d '1 hour ago' '+%d/%b/%Y:%H:%M')" '$4 > "["d1' /var/log/nginx/access.log | wc -l | xargs echo "Requêtes :"

# Erreurs 5xx
echo ""
echo "--- Erreurs 5xx (dernière heure) ---"
sudo awk '$9 ~ /^5/' /var/log/nginx/access.log | wc -l | xargs echo "Erreurs 5xx :"

# Temps de réponse moyen
echo ""
echo "--- Temps de réponse ---"
sudo awk '{sum+=$NF; count++} END {print "Moyenne : " sum/count "ms"}' /var/log/nginx/access.log

# Connexions DB
echo ""
echo "--- Connexions DB ---"
docker exec vectura-postgres psql -U vectura -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" | sed -n 3p

# File Redis
echo ""
echo "--- Redis ---"
docker exec vectura-redis redis-cli info stats | grep total_connections_received
```

### 4.2 Smoke Tests Production

| Scénario | Commande/Action | Critère de succès |
|----------|----------------|-------------------|
| Landing page | `curl -sf https://app.vectura.fr` | HTTP 200, chargement < 2s |
| API Health | `curl -sf https://api.vectura.fr/health` | JSON `{"status":"ok"}` |
| SSL valide | `openssl s_client -connect api.vectura.fr:443` | Certificat valide, TLS 1.2+ |
| Headers sécurité | `curl -I https://api.vectura.fr/health` | X-Frame-Options, CSP présents |
| Inscription chauffeur | Formulaire complet | Email reçu, compte en DB |
| Login | Credentials valides | Token JWT 15min, refresh token |
| Upload document | PDF permis C | Stocké, statut EN_ATTENTE |
| Création mission | Formulaire entreprise | Visible en base, statut OUVERTE |
| Matching | Connexion chauffeur qualifié | Mission affichée si compatible |
| Acceptation mission | Clic "Accepter" | Statut POURVUE, emails envoyés |
| Rate limiting | 6 requêtes auth rapides | HTTP 429 au 6e essai |
| Backup automatique | `ls /backups/*.gpg` | Fichier créé cette nuit |

### 4.3 Alerting Basique

```bash
#!/bin/bash
# scripts/alerting.sh — À exécuter via cron toutes les 5 minutes

ALERT_EMAIL="admin@vectura.fr"
LOG_FILE="/var/log/vectura-alerts.log"

alert() {
    echo "$(date) : $1" | tee -a "$LOG_FILE"
    echo "$1" | mail -s "[VECTURA ALERTE] $2" "$ALERT_EMAIL"
}

# Vérification API
if ! curl -sf http://localhost:3000/health > /dev/null; then
    alert "❌ API DOWN — Healthcheck échoué" "API Indisponible"
fi

# Vérification DB
if ! docker exec vectura-postgres pg_isready -U vectura > /dev/null; then
    alert "❌ DB DOWN — PostgreSQL non répondant" "Base de données"
fi

# Vérification Redis
if ! docker exec vectura-redis redis-cli ping | grep -q PONG; then
    alert "❌ REDIS DOWN" "Cache Redis"
fi

# Espace disque > 90%
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 90 ]; then
    alert "⚠️ Disque presque plein : ${DISK_USAGE}%" "Espace disque"
fi

# RAM > 90%
RAM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$RAM_USAGE" -gt 90 ]; then
    alert "⚠️ RAM presque saturée : ${RAM_USAGE}%" "Mémoire"
fi

# Erreurs 5xx > 10/min
ERRORS_5XX=$(sudo awk -v d1="$(date -d '1 minute ago' '+%d/%b/%Y:%H:%M')" '$4 > "["d1 && $9 ~ /^5/' /var/log/nginx/access.log | wc -l)
if [ "$ERRORS_5XX" -gt 10 ]; then
    alert "⚠️ Pic d'erreurs 5xx : ${ERRORS_5XX}/min" "Erreurs serveur"
fi
```

---

## PHASE 5 : STABILISATION & OPTIMISATION

### 5.1 Corrections Post-Lancement (J+1 à J+7)

| Priorité | Action | Délai | Responsable |
|----------|--------|-------|-------------|
| CRITIQUE | Bugs bloquants remontés par utilisateurs | 24h | Développeur |
| CRITIQUE | Erreurs 500 récurrentes dans les logs | 24h | Développeur |
| HAUTE | Performances API > 500ms | 48h | Développeur |
| HAUTE | Échecs de notifications SMTP | 48h | Développeur |
| NORMALE | Ajustements UX selon retours | 1 semaine | UI/UX |
| NORMALE | Optimisation images/assets frontend | 1 semaine | Développeur |
| NORMALE | Complétion tests couverture | 2 semaines | Développeur |

### 5.2 Automatisations

#### Crontab Serveur

```bash
# /etc/crontab ou crontab -e

# Backup quotidien à 3h
0 3 * * * root /opt/vectura/scripts/backup.sh >> /var/log/vectura-backup.log 2>&1

# Nettoyage logs (tous les dimanches à 4h)
0 4 * * 0 root /opt/vectura/scripts/cleanup-logs.sh

# Renouvellement SSL (tous les lundis à 9h)
0 9 * * 1 root certbot renew --quiet --post-hook "systemctl reload nginx"

# Monitoring/Alerting (toutes les 5 minutes)
*/5 * * * * root /opt/vectura/scripts/alerting.sh

# Vérification backups (tous les jours à 8h)
0 8 * * * root /opt/vectura/scripts/verify-backups.sh

# Rapport hebdomadaire (lundi 10h)
0 10 * * 1 root /opt/vectura/scripts/weekly-report.sh | mail -s "[VECTURA] Rapport hebdo" admin@vectura.fr
```

#### Script de Nettoyage : `scripts/cleanup-logs.sh`

```bash
#!/bin/bash
# scripts/cleanup-logs.sh

echo "=== Nettoyage des logs ==="

# Logs Nginx (rotation + compression)
find /var/log/nginx/ -name "access.log.*" -mtime +30 -delete
find /var/log/nginx/ -name "error.log.*" -mtime +30 -delete

# Logs Docker
docker system prune -f --volumes

# Logs applicatifs
find /opt/vectura/backend/logs/ -name "*.log" -mtime +14 -delete
find /var/log/vectura-*.log -mtime +30 -delete

# Backups temporaires
find /tmp/ -name "restore_*.sql.gz" -mtime +1 -delete

echo "✅ Nettoyage terminé"
```

### 5.3 Métriques de Succès MVP (J+30)

| Métrique | Objectif | Outil de mesure |
|----------|----------|----------------|
| Uptime | > 99.5% | UptimeRobot / StatusCake |
| Temps de réponse API p95 | < 300ms | Nginx logs / APM |
| Erreurs 5xx | < 0.1% | Nginx logs |
| Inscriptions chauffeurs | 50+ | Requête DB |
| Inscriptions entreprises | 20+ | Requête DB |
| Missions créées | 30+ | Requête DB |
| Missions pourvues | 15+ | Requête DB |
| Temps moyen matching | < 2s | Logs applicatifs |
| Taux d'acceptation mission | > 60% | Requête DB |

---

## ANNEXES

### A. Checklist GO/NO-GO Production

- [ ] **Sécurité**
  - [ ] JWT_SECRET robuste (≥64 caractères, pas de fallback)
  - [ ] Rate limiting actif sur auth/upload/API
  - [ ] CORS limité aux domaines de production
  - [ ] Uploads sécurisés (MIME + scan)
  - [ ] Headers de sécurité (HSTS, CSP, X-Frame-Options)
  - [ ] SSL valide et auto-renewal configuré
  - [ ] Firewall UFW actif
  - [ ] Conteneurs non-root

- [ ] **Base de données**
  - [ ] Index créés sur tables métier
  - [ ] Migrations testées et appliquées
  - [ ] Backup automatisé et chiffré
  - [ ] Procédure de restauration testée
  - [ ] Pool de connexions configuré

- [ ] **Tests**
  - [ ] Tests unitaires passent (>70% couverture)
  - [ ] Tests d'intégration passent
  - [ ] Smoke tests staging passent
  - [ ] Audit sécurité dépendances clean

- [ ] **Infrastructure**
  - [ ] Nginx configuré (reverse proxy, SSL, compression)
  - [ ] Docker Compose production testé
  - [ ] Healthchecks configurés
  - [ ] Monitoring basique en place
  - [ ] Alerting email configuré
  - [ ] Plan de rollback documenté et testé

- [ ] **Communication**
  - [ ] Utilisateurs prévenus de la mise en ligne
  - [ ] Support prêt à répondre
  - [ ] Status page configurée
  - [ ] Documentation admin à jour

### B. Commandes de Dépannage Rapide

```bash
# Voir les logs en temps réel
docker logs -f --tail=100 vectura-backend

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend

# Entrer dans le conteneur backend
docker exec -it vectura-backend sh

# Connexion base de données
docker exec -it vectura-postgres psql -U vectura -d vectura_prod

# Redis CLI
docker exec -it vectura-redis redis-cli

# Vérifier les processus
docker top vectura-backend

# Stats réseau d'un conteneur
docker stats vectura-backend

# Liste des migrations Prisma
cd backend && npx prisma migrate status

# Reset d'une migration (ATTENTION : perte de données possibles)
cd backend && npx prisma migrate reset --force

# Vider le cache Redis
docker exec vectura-redis redis-cli FLUSHALL

# Redémarrer tout
docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d
```

### C. Contacts et Escalade

| Rôle | Contact | Disponibilité |
|------|---------|---------------|
| Développeur Lead | dev@vectura.fr | 24/7 critique |
| Admin Système | admin@vectura.fr | 24/7 critique |
| Support Client | support@vectura.fr | L-V 8h-20h |
| Hébergeur | support@provider.com | Ticket |

### D. Documentation Associée

- `README.md` — Démarrage local et architecture
- `DOCUMENTATION/API.md` — Référence endpoints
- `DOCUMENTATION/DEPLOY.md` — Procédures de déploiement détaillées
- `CHANGELOG.md` — Historique des versions

---

> **Dernière mise à jour** : 12 Juin 2026  
> **Prochaine revue** : Post-MVP (J+30)
