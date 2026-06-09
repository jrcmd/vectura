# 🚀 PROMPT DE DÉVELOPPEMENT COMPLET — PROJET VECTURA

## 1. CONTEXTE ET OBJECTIF

Tu dois développer **Vectura**, une plateforme web de mise en relation entre **entreprises de transport** et **chauffeurs professionnels** (PL/SPL). C'est un MVP complet avec authentification, gestion documentaire, matching automatique, facturation et back-office administrateur.

**Objectif :** Créer une application full-stack, conteneurisée avec Docker, prête pour le déploiement en production.

---

## 2. STACK TECHNIQUE OBLIGATOIRE

| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 18+ avec TypeScript, Vite, Tailwind CSS, React Router DOM |
| **Backend** | Node.js + Express + TypeScript |
| **Base de données** | PostgreSQL 15+ |
| **Cache / Files** | Redis |
| **ORM** | Prisma |
| **Authentification** | JWT (access + refresh tokens) |
| **Upload fichiers** | Multer + stockage local (développement) / S3-compatible (production) |
| **Génération PDF** | Puppeteer ou PDFKit |
| **Emails** | Nodemailer + SMTP (SendGrid/Resend en production) |
| **Jobs planifiés** | node-cron |
| **Géocodage** | API OpenStreetMap Nominatim (gratuit) ou Google Maps |
| **Conteneurisation** | Docker + docker-compose |
| **Tests** | Jest (backend) + Vitest (frontend) |
| **Lint** | ESLint + Prettier |

---

## 3. ARCHITECTURE GÉNÉRALE

```
vectura/
├── docker-compose.yml          # Services: app, api, postgres, redis
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── pages/              # Pages par rôle
│   │   │   ├── public/         # Landing page, mentions légales, politique
│   │   │   ├── chauffeur/      # Inscription, login, dashboard, missions, documents
│   │   │   ├── entreprise/     # Inscription, login, dashboard, missions, favoris
│   │   │   └── admin/          # Dashboard, gestion chauffeurs, missions, conformité
│   │   ├── hooks/              # Hooks custom (auth, fetch)
│   │   ├── services/           # API clients
│   │   ├── types/              # Types TypeScript
│   │   └── utils/              # Helpers
├── backend/                    # Express + TypeScript
│   ├── src/
│   │   ├── config/             # Env, DB, Redis, Mail
│   │   ├── controllers/        # Logique métier
│   │   ├── middleware/         # Auth, validation, upload, errors
│   │   ├── routes/             # Définition des routes API
│   │   ├── services/           # Services métier (matching, facturation, notifications)
│   │   ├── jobs/               # Cron jobs (rappels, alertes, facturation, sanctions)
│   │   ├── utils/              # Helpers (geocoding, distance, PDF, emails)
│   │   ├── prisma/             # Schema, migrations, seeds
│   │   └── types/              # Types partagés
└── .env.example                # Variables d'environnement documentées
```

---

## 4. RÔLES UTILISATEURS ET PERMISSIONS

| Rôle | Description | Accès |
|------|-------------|-------|
| **CHAUFFEUR** | Professionnel du transport avec documents à valider | Espace chauffeur uniquement |
| **ENTREPRISE** | Société de transport créant des missions | Espace entreprise uniquement |
| **ADMIN** | Opérateur de la plateforme | Back-office complet |

**Règles de sécurité :**
- JWT avec expiration configurable (access: 15min, refresh: 7j)
- Middleware `requireRole()` sur chaque route protégée
- Hashage bcrypt des mots de passe (cost 12)
- Protection CSRF et headers sécurisés (helmet)
- Rate limiting sur auth et upload

---

## 5. SCHÉMA DE BASE DE DONNÉES (Prisma)

### 5.1 Utilisateurs
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String   // hash bcrypt
  role          Role     // CHAUFFEUR | ENTREPRISE | ADMIN
  status        UserStatus @default(EN_ATTENTE) // EN_ATTENTE | VALIDÉ | SUSPENDU | RADIE
  firstName     String?
  lastName      String?
  phone         String?
  city          String?   // Ville pour géocodage matching
  latitude      Float?
  longitude     Float?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Chauffeur
  driverProfile DriverProfile?

  // Entreprise
  companyProfile CompanyProfile?

  // Relations
  documents     Document[]
  missions      Mission[]        // missions acceptées (chauffeur)
  createdMissions Mission[]      @relation("CreatedBy") // missions créées (entreprise)
  favorites     Favorite[]
  sanctions     Sanction[]
  cancellations Cancellation[]

  // Auth
  refreshTokens RefreshToken[]
}

enum Role { CHAUFFEUR ENTREPRISE ADMIN }
enum UserStatus { EN_ATTENTE VALIDÉ SUSPENDU RADIE }
```

### 5.2 Profil Chauffeur (Qualifications)
```prisma
model DriverProfile {
  id              String  @id @default(uuid())
  userId          String  @unique
  user            User    @relation(fields: [userId], references: [id])

  // Permis
  hasPermisC      Boolean @default(false)
  hasPermisCE     Boolean @default(false)

  // Options
  hasADR          Boolean @default(false)
  hasFrigo        Boolean @default(false)

  // Compteur discipline
  lateCancellationCount Int @default(0)

  // Validations déduites des documents
  qualificationsValid Boolean @default(false)
}
```

### 5.3 Profil Entreprise
```prisma
model CompanyProfile {
  id          String @id @default(uuid())
  userId      String @unique
  user        User   @relation(fields: [userId], references: [id])
  companyName String
  siret       String?
  address     String?
}
```

### 5.4 Documents (Chauffeur)
```prisma
model Document {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  type          DocType  // PERMIS_C | PERMIS_CE | FIMO | FCO | CARTE_CHRONO | KBIS | URSSAF | RC_PRO
  fileUrl       String
  expiryDate    DateTime?
  status        DocStatus @default(EN_ATTENTE) // EN_ATTENTE | VALIDÉ | REJETÉ | EXPIRÉ
  uploadedAt    DateTime @default(now())
  validatedAt   DateTime?
  validatedBy   String?  // admin ID
  rejectionReason String?
}

enum DocType { PERMIS_C PERMIS_CE FIMO FCO CARTE_CHRONO KBIS URSSAF RC_PRO }
enum DocStatus { EN_ATTENTE VALIDÉ REJETÉ EXPIRÉ }
```

### 5.5 Missions
```prisma
model Mission {
  id              String   @id @default(uuid())
  title           String
  description     String?
  location        String   // Lieu de la mission
  latitude        Float?
  longitude       Float?
  missionDate     DateTime
  startTime       String   // HH:MM
  endTime         String?  // HH:MM
  truckType       TruckType // PL | SPL | ADR | FRIGO
  hourlyRate      Float    // Taux horaire
  status          MissionStatus @default(OUVERTE) // OUVERTE | POURVUE | ANNULÉE | TERMINÉE

  // Créateur (entreprise)
  creatorId       String
  creator         User     @relation("CreatedBy", fields: [creatorId], references: [id])

  // Chauffeur assigné
  driverId        String?
  driver          User?    @relation(fields: [driverId], references: [id])
  assignedAt      DateTime?

  // Priorité favoris
  favoritePriorityHours Int @default(0) // 0 = pas de priorité, 2 = 2h de priorité
  favoritePriorityStart DateTime?         // Timestamp de début de la fenêtre

  // Cycle de vie
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  statusHistory   MissionStatusHistory[]

  // Facturation
  billing         Billing?
}

enum TruckType { PL SPL ADR FRIGO }
enum MissionStatus { OUVERTE POURVUE ANNULÉE TERMINÉE }

model MissionStatusHistory {
  id          String   @id @default(uuid())
  missionId   String
  mission     Mission  @relation(fields: [missionId], references: [id])
  status      MissionStatus
  changedAt   DateTime @default(now())
  changedBy   String?  // user ID ou SYSTEM
  reason      String?
}
```

### 5.6 Favoris (Entreprise → Chauffeur)
```prisma
model Favorite {
  id          String @id @default(uuid())
  companyId   String
  company     User   @relation(fields: [companyId], references: [id])
  driverId    String
  driver      User   @relation(fields: [driverId], references: [id])
  createdAt   DateTime @default(now())

  @@unique([companyId, driverId])
}
```

### 5.7 Discipline (Sanctions)
```prisma
model Sanction {
  id            String   @id @default(uuid())
  driverId      String
  driver        User     @relation(fields: [driverId], references: [id])
  type          SanctionType // SUSPENSION | RADIATION
  startDate     DateTime @default(now())
  endDate       DateTime?    // null si radiation
  reason        String
  missionId     String?      // liée à une mission
  createdAt     DateTime @default(now())
}

enum SanctionType { SUSPENSION RADIATION }

model Cancellation {
  id          String   @id @default(uuid())
  missionId   String   @unique
  driverId    String
  driver      User     @relation(fields: [driverId], references: [id])
  cancelledAt DateTime @default(now())
  isLate      Boolean  // < 24h avant mission
  reason      String?
}
```

### 5.8 Facturation
```prisma
model Billing {
  id              String   @id @default(uuid())
  missionId       String   @unique
  mission         Mission  @relation(fields: [missionId], references: [id])

  amountBilled    Float    // Montant facturé à l'entreprise
  amountDriver    Float    // Montant reversé au chauffeur
  margin          Float    // Marge plateforme

  invoiceNumber   String?  @unique
  invoiceUrl      String?
  generatedAt     DateTime?
  weekStart       DateTime // Lundi de la semaine de facturation
  weekEnd         DateTime // Dimanche

  status          BillingStatus @default(PENDING) // PENDING | INVOICED | PAID
}

enum BillingStatus { PENDING INVOICED PAID }
```

### 5.9 Notifications / Journal
```prisma
model NotificationLog {
  id          String   @id @default(uuid())
  type        String   // DOCUMENT_EXPIRY | MISSION_REMINDER | SANCTION | COMPLIANCE
  recipientId String
  email       String
  subject     String
  sentAt      DateTime @default(now())
  status      String   // SENT | FAILED
  error       String?
}
```

### 5.10 Refresh Tokens
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## 6. RÈGLES MÉTIER CRITIQUES (À IMPLÉMENTER EXACTEMENT)

### 6.1 Inscription Chauffeur
- Formulaire : nom, prénom, téléphone (validation format FR), ville (auto-complétion), email, mot de passe
- **Statut initial :** `EN_ATTENTE` (validation admin requise)
- Le chauffeur ne peut PAS voir les missions tant que son statut n'est pas `VALIDÉ`
- Upload obligatoire : permis C/CE, FIMO ou FCO, carte chrono, Kbis, attestation URSSAF, RC Pro
- Chaque document a une date d'expiration
- Contrôle taille max 10MB, types : PDF, JPG, PNG

### 6.2 Authentification
- JWT access token (15 min) + refresh token (7 jours)
- Routes protégées par middleware `requireAuth` + `requireRole`
- Reset mot de passe par email (token temporaire)

### 6.3 Validation Documents (Admin)
- Admin peut VALIDER ou REJETER chaque document individuellement
- Si un document est REJETÉ ou EXPIRÉ → la qualification associée est BLOQUÉE
- Si URSSAF > 6 mois → conformité NON VALIDE → chauffeur bloqué pour nouvelles missions
- Journalisation de chaque action admin
- Notification email au chauffeur après validation/rejet

### 6.4 Matching Missions → Chauffeurs
Un chauffeur ne voit une mission QUE si **TOUTES** ces conditions sont remplies :
1. **Statut chauffeur** = `VALIDÉ` (pas EN_ATTENTE, SUSPENDU, RADIE)
2. **Documents valides** : permis correspondant au type de camion demandé, pas d'expiration
3. **Qualification compatible** : permis C/CE/ADR/Frigo selon mission.truckType
4. **Distance** : ville chauffeur ↔ lieu mission ≤ rayon max configurable (km)
5. **Fenêtre priorité favoris** : si mission a `favoritePriorityHours > 0` et `favoritePriorityStart` défini :
   - Avant expiration de la fenêtre : mission visible UNIQUEMENT par les chauffeurs favoris de l'entreprise
   - Après expiration : mission visible par tous les chauffeurs qualifiés
6. **Mission non pourvue** : status = `OUVERTE`

**Algorithme de distance :**
- Géocoder ville chauffeur et lieu mission (lat/lng)
- Calculer distance en km (formule haversine)
- Rayon max configurable via variable d'environnement `MATCHING_MAX_RADIUS_KM`

### 6.5 Cycle de vie Mission
```
OUVERTE → (chauffeur accepte) → POURVUE → (mission terminée) → TERMINÉE
OUVERTE → (entreprise annule) → ANNULÉE
POURVUE → (chauffeur annule > H-24) → OUVERTE (remise en ligne)
POURVUE → (chauffeur annule < H-24) → OUVERTE + SANCTION chauffeur
```
- Chaque changement de statut est journalisé dans `MissionStatusHistory`

### 6.6 Discipline Chauffeur (RÈGLE STRICTE)
- **Annulation possible** jusqu'à H-24 avant la mission
- **Bloquer le bouton** de désistement si < 24h avant mission
- Si annulation < 24h (désistement tardif) :
  1. Incrémenter `lateCancellationCount`
  2. **1er cas** : SUSPENSION automatique 7 jours
  3. **2ème cas** : SUSPENSION automatique 7 jours
  4. **3ème cas** : RADIATION automatique (statut = RADIE, accès missions bloqué définitivement)
- Le chauffeur voit son statut SUSPENDU ou RADIE sur son dashboard
- Cron job quotidien pour détecter les annulations tardives et appliquer les sanctions

### 6.7 Tarification Plancher
- **PL** : taux horaire minimum configurable (ex: 25€/h)
- **SPL** : taux horaire minimum configurable (ex: 30€/h)
- Validation FRONT : empêcher la saisie sous le seuil
- Validation BACK : refuser l'API si sous le seuil avec message explicite
- Tests unitaires obligatoires sur cette règle

### 6.8 Priorité Favoris (Entreprise)
- Au moment de créer une mission, l'entreprise peut cocher "Priorité favoris 2h"
- Si coché : `favoritePriorityHours = 2`, `favoritePriorityStart = now()`
- La mission n'est visible que par les chauffeurs favoris pendant 2 heures
- Après 2h : diffusion générale à tous les chauffeurs qualifiés
- Test métier obligatoire sur la bascule

### 6.9 Notifications Automatiques (Cron Jobs)
| Job | Fréquence | Action |
|-----|-----------|--------|
| **Rappel mission J-1** | Quotidien 18h | Mail au chauffeur pour missions demain |
| **Rappel mission J (matin)** | Quotidien 7h | Mail au chauffeur pour missions aujourd'hui |
| **Alerte documents J-30** | Quotidien | Mail aux chauffeurs avec documents expirant dans 30j |
| **Alerte documents J-7** | Quotidien | Mail aux chauffeurs avec documents expirant dans 7j |
| **Contrôle annulations tardives** | Quotidien | Appliquer suspensions/radiations automatiques |
| **Facturation hebdomadaire** | Lundi 6h | Générer factures PDF par entreprise pour semaine passée |
| **Conformité URSSAF** | Quotidien | Détecter attestations > 6 mois, bloquer missions, relancer mail |

**Templates email obligatoires :**
- Validation/rejet de document
- Rappel mission (J-1 et J)
- Relance conformité URSSAF
- Notification sanction (suspension/radiation)
- Expiration documentaire

### 6.10 Facturation
- **Montant facturé entreprise** = taux horaire × heures (ou forfait selon mission)
- **Montant reversé chauffeur** = montant facturé - marge plateforme
- **Marge** = configurable (ex: 15%)
- **Facture hebdomadaire** : regroupement par entreprise des missions `TERMINÉE` de la semaine passée
- **Numéro de facture** : format `F-YYYY-WW-XXXX` (année, semaine, séquentiel)
- **PDF** : généré côté backend, stocké, téléchargeable par l'entreprise et l'admin
- **Export comptable admin** : CSV et Excel avec colonnes (facture, mission, dates, montants, marge)

### 6.11 Conformité URSSAF
- Attestation URSSAF valide 6 mois maximum
- Si > 6 mois : statut conformité = NON VALIDE
- Chauffeur bloqué pour nouvelles missions (mais missions en cours conservées)
- Admin peut envoyer une relance mail type depuis le back-office
- Vue dédiée "Conformité vigilance" dans le back-office

---

## 7. FONCTIONNALITÉS FRONTEND (DÉTAIL PAR RÔLE)

### 7.1 Landing Page Publique (Responsive, Mobile-First)
- Header avec navigation
- Hero section avec double CTA (Chauffeur / Entreprise)
- Section bénéfices chauffeur
- Section bénéfices entreprise
- Section fonctionnement (inscription → mission → validation)
- Section réassurance (confiance, conformité, simplicité)
- Footer avec liens mentions légales et politique de confidentialité (RGPD)
- QR code pour flyers
- Tracking clic CTA (analytics)
- SEO optimisé (meta tags, Open Graph)
- Performance mobile optimisée (lazy loading, images compressées)

### 7.2 Espace Chauffeur
- **Inscription** : formulaire multi-étapes avec validation temps réel
- **Login** : email + mot de passe
- **Dashboard** :
  - Bannière de statut (EN_ATTENTE / VALIDÉ / SUSPENDU / RADIE)
  - Documents manquants / validés / rejetés
  - Missions disponibles (filtrées par matching)
  - Message bloquant si EN_ATTENTE
  - État vide si aucune mission
- **Dépôt documents** : upload drag & drop par type de document + date d'expiration
- **Détail mission** : lieu, date, horaires, tarif, type camion, bouton accepter + confirmation
- **Désistement** : bouton avec blocage si < H-24

### 7.3 Espace Entreprise
- **Inscription / Login**
- **Profil entreprise**
- **Création mission** : formulaire avec type camion, date, horaires, lieu, description, taux horaire (validation plancher), case "Priorité favoris 2h"
- **Dashboard** :
  - Missions en cours
  - Missions passées
  - Factures hebdomadaires (liste + téléchargement PDF)
- **Favoris** : liste des chauffeurs favoris, ajout/suppression depuis profil chauffeur, filtre sur missions
- **Historique** : missions créées avec statuts

### 7.4 Back-Office Administrateur
- **Dashboard** avec KPI :
  - Missions en cours (nombre de chauffeurs en mission)
  - Alertes documents (expiration proche)
  - Nouveaux inscrits en attente
  - CA hebdomadaire
  - Loading states et fallbacks
- **Gestion chauffeurs** :
  - Tableau avec colonnes : nom, prénom, téléphone, statut, qualifications (C, CE, ADR, Frigo), note moyenne
  - Filtres par statut
  - Recherche par nom/téléphone
  - Vue détail : documents uploadés, dates d'expiration, boutons valider/rejeter
- **Suivi missions** :
  - Missions non pourvues (urgentes)
  - Missions à venir
  - Historique
  - Filtres date et statut
- **Conformité URSSAF** :
  - Liste des attestations > 6 mois
  - Bouton relance mail
  - Journal des relances
- **Facturation / Marge** :
  - Vue marge par mission et par semaine
  - Filtre par période
  - Export CSV/Excel

---

## 8. API ENDPOINTS (STRUCTURE)

### Auth
- `POST /api/auth/register` (chauffeur ou entreprise)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Chauffeur
- `GET /api/driver/profile` — son profil
- `PUT /api/driver/profile` — modifier profil
- `POST /api/driver/documents` — upload document
- `GET /api/driver/documents` — liste documents
- `GET /api/driver/missions` — missions disponibles (matching appliqué)
- `POST /api/driver/missions/:id/accept` — accepter mission
- `POST /api/driver/missions/:id/cancel` — annuler (avec contrôle H-24)

### Entreprise
- `GET /api/company/profile`
- `PUT /api/company/profile`
- `POST /api/company/missions` — créer mission (validation plancher)
- `GET /api/company/missions` — missions créées
- `GET /api/company/favorites` — chauffeurs favoris
- `POST /api/company/favorites/:driverId` — ajouter favori
- `DELETE /api/company/favorites/:driverId` — retirer favori
- `GET /api/company/invoices` — factures hebdomadaires
- `GET /api/company/invoices/:id/download` — télécharger PDF

### Admin
- `GET /api/admin/dashboard` — KPI
- `GET /api/admin/drivers` — liste chauffeurs (filtres, recherche)
- `GET /api/admin/drivers/:id` — détail chauffeur
- `POST /api/admin/drivers/:id/documents/:docId/validate` — valider document
- `POST /api/admin/drivers/:id/documents/:docId/reject` — rejeter document
- `GET /api/admin/missions` — toutes missions
- `GET /api/admin/compliance` — conformité URSSAF
- `POST /api/admin/compliance/:driverId/remind` — relance mail
- `GET /api/admin/billing` — données facturation
- `GET /api/admin/billing/export` — export CSV/Excel
- `GET /api/admin/billing/margin` — marge par période

---

## 9. SÉCURITÉ ET CONFORMITÉ

- **RGPD** : pages mentions légales + politique confidentialité
- **Uploads** : vérification type MIME, taille max 10MB, scan basique
- **SQL Injection** : Prisma (requêtes paramétrées)
- **XSS** : échappement côté frontend (React auto) + validation backend
- **CORS** : configuré strictement
- **Helmet** : headers sécurisés
- **Rate limiting** : 100 req/min global, 5 req/min sur auth
- **Journalisation** : logs des actions admin, connexions, erreurs API
- **Backup** : stratégie de sauvegarde PostgreSQL documentée

---

## 10. DOCKER-COMPOSE (Services)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vectura
      POSTGRES_USER: vectura
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./uploads:/app/uploads
  redis:
    image: redis:7-alpine
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://vectura:${DB_PASSWORD}@postgres:5432/vectura
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - MATCHING_MAX_RADIUS_KM=${MATCHING_MAX_RADIUS_KM:-50}
      - MIN_RATE_PL=${MIN_RATE_PL:-25}
      - MIN_RATE_SPL=${MIN_RATE_SPL:-30}
      - PLATFORM_MARGIN_PERCENT=${PLATFORM_MARGIN_PERCENT:-15}
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

---

## 11. ENVIRONNEMENT (.env.example)

```
# Base de données
DATABASE_URL=postgresql://vectura:password@localhost:5432/vectura

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# SMTP / Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@vectura.fr

# Matching
MATCHING_MAX_RADIUS_KM=50

# Tarification (€/heure)
MIN_RATE_PL=25
MIN_RATE_SPL=30

# Marge plateforme (%)
PLATFORM_MARGIN_PERCENT=15

# Uploads
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=./uploads

# Frontend
VITE_API_URL=http://localhost:3000/api
```

---

## 12. TESTS OBLIGATOIRES

### Backend (Jest)
- [ ] Inscription/connexion chauffeur et entreprise
- [ ] Login/logout sécurisé
- [ ] Upload documents (taille, type, sécurité)
- [ ] Validation admin (valider/rejeter)
- [ ] Création mission (validation plancher PL/SPL)
- [ ] Matching (distance, qualifications, statut, favoris)
- [ ] Annulation tardive (suspension 7j, radiation au 3ème)
- [ ] Facturation (calculs, génération PDF)
- [ ] Exports (format CSV/Excel)
- [ ] Rôles et permissions (accès non autorisés)
- [ ] Upload malveillant (contrôles)

### Frontend (Vitest + React Testing Library)
- [ ] Formulaires avec validation
- [ ] Affichage conditionnel selon statut
- [ ] Boutons désactivés selon règles métier
- [ ] Responsive design

---

## 13. CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

---

## 14. INSTRUCTIONS DE DÉVELOPPEMENT

1. **Initialiser** : `docker-compose up -d` doit démarrer toute la stack
2. **Migrations** : `npx prisma migrate dev` + seed de test
3. **Démarrage** : `npm run dev` (frontend + backend en parallèle)
4. **Tests** : `npm run test` (doit passer à 100% pour les règles métier critiques)
5. **Lint** : `npm run lint` (zero warning)
6. **Build** : `docker-compose -f docker-compose.prod.yml up --build`

---

## 15. CONTRAINTES ET EXIGENCES FINALES

- **Mobile-first** : toutes les pages doivent être pleinement fonctionnelles sur smartphone
- **Performance** : Lighthouse score > 80 sur mobile
- **Accessibilité** : WCAG 2.1 AA (états hover/focus, contrastes, aria-labels)
- **État vide** : chaque liste doit avoir un état vide explicite
- **Loading** : skeletons ou spinners sur tous les chargements async
- **Erreurs** : messages explicites en français, pas de crash silencieux
- **Journal** : toutes les actions métier importantes sont loguées (validation, sanction, facturation)
- **Extensibilité** : le code doit permettre l'ajout facile de nouvelles qualifications (permis, options)

---

## 16. RÉSUMÉ DES RÈGLES MÉTIER LES PLUS CRITIQUES

| Règle | Implémentation | Priorité |
|-------|---------------|----------|
| Statut chauffeur EN_ATTENTE = pas de missions | Middleware matching | CRITIQUE |
| Annulation < H-24 = suspension 7j | Cron + middleware | CRITIQUE |
| 3ème annulation tardive = RADIÉ | Cron + middleware | CRITIQUE |
| Tarif < plancher = refus API | Validation back + front | CRITIQUE |
| Priorité favoris 2h puis diffusion générale | Filtrage matching | CRITIQUE |
| URSSAF > 6 mois = blocage missions | Cron + middleware | CRITIQUE |
| Documents invalides = qualifications bloquées | Logique validation | CRITIQUE |
| Distance > rayon max = mission invisible | Haversine + filtre | CRITIQUE |
| JWT sécurisé + routes protégées | Auth middleware | CRITIQUE |
| Facture hebdomadaire auto | Cron + PDF | HAUTE |

---

**FIN DU PROMPT.**

Tu es une IA de développement full-stack senior. Réalise ce projet en respectant scrupuleusement chaque règle métier, chaque type de données, et chaque contrainte de sécurité. Le code doit être production-ready, bien documenté, et testé.
