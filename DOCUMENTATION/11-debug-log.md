# Debug log de l'état courant du projet Vectura

## Contexte
Date : 2026-06-12
Branch / workspace : projet Vectura
Objectif : Compléter les priorités de correction sans casser l'application.

## Changements récents
- Priorité 7 implémentée : sécurité des uploads
- Ajout de `fileValidationService.ts` et `pdfScanService.ts`
- Documentations ajoutées/complétées
- Backend Docker non-root validé
- Backup chiffré avec retention validé

## Vérifications
- `npm run type-check` : OK
- `npm test --silent` : 6 suites, 41 tests passés
- Backend Docker build : OK
- Backend Docker uptime / healthcheck : OK

## Fichiers modifiés
- `backend/Dockerfile`
- `backend/src/routes/documentsRoutes.ts`
- `backend/src/services/fileValidationService.ts`
- `backend/src/services/pdfScanService.ts`
- `backend/src/services/backupService.ts`
- `backend/jest.config.js`
- `backend/.env`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `DOCUMENTATION/09-backup-restore.md`
- `DOCUMENTATION/10-priorities-summary.md`

## Notes de debug
- `file-type` et `pdf-parse` sont ESM-only ; `jest.config.js` a été adapté avec `transformIgnorePatterns`
- `backupService.ts` utilise `openssl` et `pg_dump` pour backup/restaure
- `documentsRoutes.ts` utilise lazy import pour éviter des erreurs ESM dans les tests
- `docker compose` a démarré le backend en `appuser`

## Prochaines étapes
1. Priorité 8 - centraliser JWT + RBAC
2. Priorité 9 - retry notifications et endpoint monitoring
3. Priorité 10 - accessibilité frontend

## Commandes utiles
- `cd backend && npm run type-check`
- `cd backend && npm test --silent`
- `docker compose build backend`
- `docker compose up -d`
- `docker compose logs backend | tail -20`
