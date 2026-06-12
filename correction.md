Tu es un développeur full-stack senior et expert en sécurité applicative. Tu dois corriger les 10 priorités absolues identifiées lors de l'audit du projet Vectura (plateforme de mise en relation chauffeurs PL/SPL et entreprises de transport).

CONTEXTE TECHNIQUE :
- Backend : Node.js + Express + TypeScript + Prisma ORM + PostgreSQL
- Frontend : React + TypeScript + Tailwind CSS
- Infra : Docker + Docker Compose + Redis (présent mais inutilisé)
- Auth : JWT (access token 15min + refresh token)
- Uploads : Multer (limitation extension/taille)
- Jobs : node-cron (rappels, sanctions, facturation)
- Tests : Jest + ESLint configurés

RÈGLES DE CORRECTION :
- Implémente UNE SEULE priorité à la fois
- Fournis le code COMPLET et FONCTIONNEL pour chaque fichier modifié
- Ajoute des commentaires explicatifs en français
- Respecte la structure de dossiers existante
- Teste chaque correction avant de passer à la suivante
- Attends ma validation avant de passer à la priorité suivante

---

## PRIORITÉ 1 : SÉCURISER JWT_SECRET ET REFUSER LE DÉMARRAGE SI ABSENT

Fichiers concernés : `backend/src/config/env.ts` (ou équivalent), `backend/src/server.ts`, `backend/src/lib/jwt.ts`

Actions :
1. Créer un validateur strict des variables d'environnement au démarrage
2. Refuser le démarrage du serveur si JWT_SECRET est absent, undefined ou égal à 'change-me'
3. Vérifier que REFRESH_TOKEN_SECRET est également défini
4. Ajouter un message d'erreur explicite dans les logs
5. Documenter dans .env.example les valeurs requises

Code attendu :
- Fonction `validateEnv()` qui vérifie toutes les variables critiques
- Middleware de protection empêchant le fallback sur 'change-me'
- TypeScript strict : pas de `?? 'change-me'` dans le code

---

## PRIORITÉ 2 : ACTIVER RATE LIMITING SUR ENDPOINTS SENSIBLES

Fichiers concernés : `backend/src/middleware/rateLimiter.ts`, `backend/src/routes/authRoutes.ts`, `backend/src/routes/documentsRoutes.ts`, `backend/src/server.ts`

Actions :
1. Implémenter `rate-limiter-flexible` (déjà en dépendances) avec Redis ou mémoire
2. Créer 3 limites :
   - Auth : 5 tentatives / 15 minutes par IP
   - Upload : 10 fichiers / heure par utilisateur
   - API générale : 100 requêtes / 15 minutes par IP
3. Appliquer aux routes concernées
4. Retourner un message d'erreur 429 clair

Code attendu :
- Middleware réutilisable `createRateLimiter()`
- Configuration par route
- Gestion des headers Retry-After

---

## PRIORITÉ 3 : OPTIMISER LE MATCHING ET ÉVITER LE CHARGEMENT COMPLET DES MISSIONS

Fichiers concernés : `backend/src/services/matchingService.ts`, `backend/src/services/distanceService.ts`

Actions :
1. Modifier `findCompatibleMissions()` pour filtrer côté DB avant le matching :
   - Filtrer par statut = OUVERTE
   - Filtrer par date >= aujourd'hui
   - Filtrer par zone géographique approximative (bounding box ou code postal)
2. Remplacer les requêtes N+1 sur les favoris par un `findMany` groupé
3. Ajouter un paramètre de pagination (limit/offset)
4. Logger les temps d'exécution pour monitoring

Code attendu :
- Requête Prisma optimisée avec `where`, `include` et `take/skip`
- Pré-filtre géographique simple (rayon max configurable via env)
- Suppression des boucles `for` avec requêtes internes

---

## PRIORITÉ 4 : AJOUTER DES INDEX CRITIQUES SUR LA BASE DE DONNÉES

Fichier concerné : `backend/prisma/schema.prisma`

Actions :
1. Ajouter les index suivants :
   - `@@index([status, missionDate])` sur Mission
   - `@@index([expiryDate])` sur Document
   - `@@index([companyId, driverId])` sur Favorite
   - `@@index([driverId, status])` sur Mission
   - `@@index([createdAt])` sur AuditEvent
2. Générer la migration Prisma
3. Documenter dans un commentaire la raison de chaque index

Code attendu :
- Schema Prisma mis à jour
- Commande de migration à exécuter
- Explication des gains de performance attendus

---

## PRIORITÉ 5 : STRATÉGIE DE SAUVEGARDE EXTERNE ET CHIFFRÉE

Fichiers concernés : `backend/src/services/backupService.ts`, `docker-compose.prod.yml`, `backend/Dockerfile`

Actions :
1. Modifier `backupService.ts` pour :
   - Exporter vers un volume externe (pas dans le conteneur)
   - Nommer les dumps avec timestamp
   - Chiffrer les dumps avec gpg ou openssl
   - Netoyer les dumps de +30 jours
2. Mettre à jour `docker-compose.prod.yml` avec un volume externe backups
3. Documenter la procédure de restauration

Code attendu :
- Script de backup automatisé
- Configuration Docker volumes
- Procédure de restore testée

---

## PRIORITÉ 6 : EXÉCUTION NON-ROOT DANS LE BACKEND DOCKERFILE

Fichier concerné : `backend/Dockerfile`

Actions :
1. Créer un utilisateur `appuser` (UID 1001) dans l'image
2. Donner les permissions nécessaires sur /app et /uploads
3. Exécuter le serveur avec `USER appuser`
4. Vérifier que les healthchecks fonctionnent toujours

Code attendu :
- Dockerfile complet avec USER non-root
- Permissions correctes sur les dossiers
- HEALTHCHECK maintenu

---

## PRIORITÉ 7 : RENFORCER LA SÉCURITÉ DES UPLOADS (MIME + SCAN)

Fichiers concernés : `backend/src/middleware/upload.ts`, `backend/src/routes/documentsRoutes.ts`

Actions :
1. Vérifier le type MIME réel avec `file-type` ou `magic-bytes`
2. Rejeter les fichiers dont l'extension ne correspond pas au MIME
3. Scanner les PDF avec `pdf-parse` pour détecter les scripts embarqués
4. Limiter à 5Mo par fichier
5. Stocker les fichiers hors du répertoire public avec nom aléatoire

Code attendu :
- Middleware upload sécurisé
- Validation MIME stricte
- Nettoyage des fichiers rejetés

---

## PRIORITÉ 8 : CENTRALISER LA VÉRIFICATION JWT/RBAC

Fichiers concernés : `backend/src/middleware/auth.ts` (nouveau), `backend/src/middleware/requireAdmin.ts`, `backend/src/middleware/requireCompany.ts`, `backend/src/middleware/requireDriver.ts`

Actions :
1. Créer un middleware unique `authenticate()` qui :
   - Vérifie le JWT
   - Décode le payload
   - Attache `req.user` avec id, email, role
2. Créer un middleware `authorize(roles: string[])` qui vérifie le rôle
3. Remplacer les 3 middlewares existants par des appels à `authorize()`
4. Supprimer la duplication de logique JWT

Code attendu :
- `auth.ts` : authentification centralisée
- `authorize.ts` : vérification des rôles
- Refactor des routes existantes

---

## PRIORITÉ 9 : RENFORCER LE SUIVI DES ÉCHECS DE NOTIFICATION

Fichiers concernés : `backend/src/services/mailService.ts`, `backend/src/services/notificationService.ts`, `backend/prisma/schema.prisma`

Actions :
1. Ajouter un champ `retryCount` et `maxRetries` dans NotificationLog
2. Implémenter un système de retry exponentiel (1min, 5min, 15min)
3. Marquer les notifications en `FAILED` après 3 échecs
4. Créer un endpoint admin pour visualiser les échecs
5. Logger les erreurs SMTP détaillées

Code attendu :
- Modèle Prisma mis à jour
- Logique de retry dans mailService
- Endpoint de monitoring admin

---

## PRIORITÉ 10 : AUDIT ACCESSIBILITÉ MINIMAL DES FORMULAIRES

Fichiers concernés : `frontend/src/components/forms/`, `frontend/src/pages/auth/`

Actions :
1. Ajouter `aria-label` et `aria-describedby` sur tous les champs de formulaire
2. Vérifier les contrastes (ratio minimum 4.5:1)
3. Ajouter `focus-visible` styles sur les éléments interactifs
4. S'assurer que la navigation clavier fonctionne (tabindex logique)
5. Ajouter des messages d'erreur liés aux champs via `aria-invalid` et `aria-errormessage`

Code attendu :
- Composants Input, Button, Select accessibles
- Exemple de formulaire d'inscription chauffeur corrigé
- CSS focus-visible cohérent

---

FORMAT DE RÉPONSE :
Pour chaque priorité, fournis :
1. Le nom du fichier modifié/créé
2. Le code COMPLET du fichier
3. Les commandes à exécuter (migration, install, test)
4. Une brève explication des changements

Attends ma validation avant de passer à la priorité suivante.