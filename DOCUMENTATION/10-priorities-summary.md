# Résumé des priorités implémentées

Ce document résume les priorités de correction implémentées pour le projet Vectura jusqu'à présent.

## Priorités terminées

### Priorité 1 : JWT secrets sécurisés
- Centralisation des secrets JWT dans `backend/src/lib/jwt.ts`
- Validation stricte des variables d'environnement dans `backend/src/config/env.ts`
- Rejet au démarrage si `JWT_SECRET` ou `REFRESH_TOKEN_SECRET` est absent ou insecure
- Tests et validation passés

### Priorité 2 : Rate limiting
- Implémentation d'un middleware réutilisable `backend/src/middleware/rateLimiter.ts`
- Limitation des endpoints critiques : auth, upload, inscription
- Support Redis + fallback mémoire
- Tests et validation passés

### Priorité 3 : Matching optimisé
- Optimisation du matching des missions via découpage en bounding box
- Requêtes Prisma ciblées sans chargement de toutes les missions ouvertes
- Pagination `?page=&limit=` pour listes de missions
- Tests et validation passés

### Priorité 4 : Index critiques sur la base de données
- Ajout d'index Prisma pour `Document`, `Mission`, `Favorite`, `AuditEvent`
- Migration Prisma générée et appliquée : `20260612083915_add_critical_indexes`
- Validation en base PostgreSQL
- Tests et validation passés

### Priorité 5 : Backup externe chiffré
- Mise en place du service de sauvegarde `backend/src/services/backupService.ts`
- Chiffrement OpenSSL AES-256-CBC
- Retention automatique 30 jours
- Volume Docker externe `/app/backups`
- Documentation de restauration ajoutée dans `DOCUMENTATION/09-backup-restore.md`
- Tests et validation passés

### Priorité 6 : Docker backend non-root
- Ajout d'un utilisateur `appuser` UID 1001 dans `backend/Dockerfile`
- Permissions correctes sur `/app`, `/app/uploads`, `/app/backups`
- Exécution du service sous `USER appuser`
- Vérification de l'état healthy du backend
- Tests et validation passés

### Priorité 7 : Sécurité des uploads
- Validation stricte du type MIME avec `file-type`
- Scan PDF pour scripts et actions suspectes avec `pdf-parse`
- Limitation du fichier à 5 MB
- Stockage hors répertoire public avec nom de fichier aléatoire
- Tests et validation passés

## Documents de référence
- `DOCUMENTATION/09-backup-restore.md` : procédure backup/restore
- `backend/Dockerfile` : exécution non-root
- `backend/src/routes/documentsRoutes.ts` : sécurité upload
- `backend/src/services/backupService.ts` : service de sauvegarde
- `backend/src/services/fileValidationService.ts` : validation MIME
- `backend/src/services/pdfScanService.ts` : scan PDF

## Statut
- Priorités 1 à 7 complètes et validées
- Priorité 8 prête à démarrer : centralisation JWT / RBAC
