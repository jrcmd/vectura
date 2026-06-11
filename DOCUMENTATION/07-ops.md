# Ops - Vectura

## CI/CD GitHub Actions

Pipeline `.github/workflows/ci.yml` :

### Jobs

1. **lint** : ESLint frontend + backend
2. **test** : Jest backend + Vitest frontend (avec PostgreSQL + Redis services)
3. **build** : Build frontend et backend

### Déclencheurs

- `push` sur n'importe quelle branche
- `pull_request` sur n'importe quelle branche

## Déploiement

### Staging

À définir : pipeline de déploiement automatique vers environnement préproduction.

### Production

Stratégie :
- Build des images Docker
- Déploiement sur plateforme (À définir : AWS ECS, Railway, etc)
- Variables d'environnement injectées
- Migration DB via Prisma

### Rollback

- Images Docker versionnées
- Reversion via `git revert` + redéploiement
- À automatiser côté CI

## Monitoring

### Logs

- Pino HTTP logger côté backend
- Niveau : `info` en dev, `warn` en prod

### Métriques

À implémenter :
- Nombre de missions créées
- Taux de conversion inscription
- Latence API

## Sauvegardes

### PostgreSQL

```bash
# Backup
docker exec postgres pg_dump -U vectura vectura > backup.sql

# Restaurer
cat backup.sql | docker exec -i postgres psql -U vectura vectura
```

Volumes Docker persistants à sauvegarder régulièrement.

## Alertes

### Jobs planifiés (node-cron)

- Quotidien : Documents expirant à J-30 / J-7
- Quotidien : URSSAF > 6 mois
- J-1 : Rappel mission
- Matin J : Rappel mission
- Quotidien : Détection annulations tardives

### Notification mail

Templates :
- Expiration document
- Rappel mission
- Validation / rejet document
- Sanction (suspension / radiation)