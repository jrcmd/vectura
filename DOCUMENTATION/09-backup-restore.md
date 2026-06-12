# Stratégie de Sauvegarde et Restauration - Priorité 5

## Vue d'ensemble

Cette implémentation ajoute une stratégie de sauvegarde automatisée, chiffrée et avec retention policy pour Vectura.

### Caractéristiques

- ✅ **Exports externes**: Dumps PostgreSQL vers volume Docker `/app/backups`
- ✅ **Chiffrement**: AES-256-CBC avec OpenSSL
- ✅ **Timestamping**: Format ISO 8601 pour chronologie claire
- ✅ **Retention**: Nettoyage automatique des backups > 30 jours
- ✅ **Restauration**: Fonction `restoreFromBackup()` pour recovery

---

## Architecture

### Répertoire des sauvegardes

```
/app/backups/                           (volume externe prod_backups)
├── vectura-production-2026-06-12T10-30-45.dump.enc     (chiffré)
├── vectura-production-2026-06-12T10-30-45.dump.enc.json (metadata)
├── vectura-staging-2026-06-12T11-00-00.dump.enc
└── vectura-staging-2026-06-12T11-00-00.dump.enc.json
```

### Format de timestamp

- Format: `YYYY-MM-DDTHH-mm-ss` (exemple: `2026-06-12T10-30-45`)
- Permet un tri chronologique simple par nom de fichier
- Lisible et sans caractères problématiques pour le filesystem

### Métadonnées

Chaque backup `.dump.enc` est accompagné d'un fichier `.dump.enc.json`:

```json
{
  "createdAt": "2026-06-12T10:30:45.123Z",
  "environment": "production",
  "databaseUrlConfigured": true,
  "uploadDir": "/app/uploads",
  "encrypted": true
}
```

---

## Configuration

### Variables d'environnement

Ajouter à `.env` (production):

```bash
# Chiffrement des backups
BACKUP_ENCRYPTION_ENABLED=true
BACKUP_ENCRYPTION_PASSPHRASE=your-strong-passphrase-here-change-in-prod

# Rétention (jours)
# La logique est codée à BACKUP_RETENTION_DAYS=30 dans backupService.ts
```

### Docker Compose

Le volume externe est déjà configuré dans `docker-compose.prod.yml`:

```yaml
volumes:
  prod_backups:    # Volume persiste après docker compose down

backend-prod:
  environment:
    BACKUP_ENCRYPTION_ENABLED: ${BACKUP_ENCRYPTION_ENABLED:-true}
    BACKUP_ENCRYPTION_PASSPHRASE: ${BACKUP_ENCRYPTION_PASSPHRASE}
  volumes:
    - prod_backups:/app/backups
```

### Permissions

Les backups sont créés par l'utilisateur Node.js du conteneur (défaut: root en dev, `appuser` en prod après Priorité 6).

---

## Processus de sauvegarde

### Déclenchement automatique

Le backup s'exécute via une tâche cron ou un job schedulé:

```typescript
import { runPostgresBackup } from '@/services/backupService';

// Chaque jour à 2h du matin UTC (exemple)
const job = schedule.scheduleJob('0 2 * * *', async () => {
  const result = await runPostgresBackup('production');
  console.log(result.ok ? 'Backup réussi' : `Erreur: ${result.error}`);
});
```

### Étapes du backup

1. **Créer le répertoire**: `/app/backups` (si n'existe pas)
2. **Générer le dump**: `pg_dump --format=custom` → `.dump`
3. **Chiffrer**: `openssl enc -aes-256-cbc` → `.dump.enc`
4. **Supprimer le plaintext**: Supprime le `.dump` après chiffrement
5. **Créer les métadonnées**: Fichier `.dump.enc.json`
6. **Nettoyer les anciens**: Supprime les backups > 30 jours
7. **Enregistrer dans DB**: Crée une entrée `BackupRun` dans Prisma

### Code de backup

```typescript
const result = await runPostgresBackup('production');

if (result.ok) {
  console.log(`✅ Backup saved at: ${result.backup.backupPath}`);
  console.log(`Size: ${(result.backup.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.error(`❌ Backup failed: ${result.error}`);
}
```

---

## Procédure de restauration

### Prérequis

- ✅ Accès au répertoire `/app/backups`
- ✅ Fichier `.dump.enc` à restaurer
- ✅ Passphrase de chiffrement
- ✅ `pg_restore` installé
- ✅ Accès à la base de données PostgreSQL

### Restauration depuis le backend (API)

Créer un endpoint admin (sécurisé):

```typescript
import { restoreFromBackup } from '@/services/backupService';

app.post('/api/admin/restore', requireAdmin, async (req, res) => {
  const { backupFile, passphrase } = req.body;
  
  const result = await restoreFromBackup(backupFile, passphrase);
  
  if (result.ok) {
    res.json({ message: result.message });
  } else {
    res.status(400).json({ error: result.message });
  }
});
```

### Restauration manuelle depuis le CLI

#### 1. Accéder au conteneur

```bash
docker compose -f docker-compose.prod.yml exec backend-prod bash
```

#### 2. Lister les backups disponibles

```bash
ls -lh /app/backups/*.dump.enc
# vectura-production-2026-06-12T10-30-45.dump.enc (52 MB)
```

#### 3. Déchiffrer le backup

```bash
openssl enc -d -aes-256-cbc \
  -in /app/backups/vectura-production-2026-06-12T10-30-45.dump.enc \
  -out /tmp/vectura.dump \
  -k "your-passphrase-here" \
  -md sha256
```

#### 4. Restaurer la base de données

```bash
# Attention: Cette commande remplace la base existante!

pg_restore \
  --dbname postgresql://vectura:password@postgres-prod:5432/vectura \
  --clean \
  --if-exists \
  /tmp/vectura.dump
```

#### 5. Vérifier la restauration

```bash
psql -U vectura -d vectura -c "SELECT COUNT(*) FROM \"User\";"
```

### Restauration via script shell (non-interactif)

```bash
#!/bin/bash
set -e

BACKUP_FILE="${1:-vectura-production-2026-06-12T10-30-45.dump.enc}"
PASSPHRASE="${BACKUP_ENCRYPTION_PASSPHRASE}"
DATABASE_URL="postgresql://vectura:password@postgres-prod:5432/vectura"

echo "🔓 Déchiffrement du backup..."
openssl enc -d -aes-256-cbc \
  -in "/app/backups/$BACKUP_FILE" \
  -out /tmp/vectura.dump \
  -k "$PASSPHRASE" \
  -md sha256

echo "⏳ Restauration de la base de données..."
pg_restore \
  --dbname "$DATABASE_URL" \
  --clean \
  --if-exists \
  --verbose \
  /tmp/vectura.dump

echo "✅ Restauration terminée!"
rm -f /tmp/vectura.dump
```

### Restauration complète (application de tous les backups)

```bash
# Restaurer en cascade (ex: migration)
for backup in /app/backups/*.dump.enc; do
  echo "Processing: $backup"
  openssl enc -d -aes-256-cbc \
    -in "$backup" \
    -out /tmp/temp.dump \
    -k "$BACKUP_ENCRYPTION_PASSPHRASE" \
    -md sha256
  
  pg_restore --dbname "$DATABASE_URL" --clean --if-exists /tmp/temp.dump
done
```

---

## Opérations courantes

### Voir l'historique des backups

```bash
# Via API ou CLI du conteneur
docker compose -f docker-compose.prod.yml exec backend-prod npm run backup:list

# Ou lister les fichiers
docker compose -f docker-compose.prod.yml exec backend-prod \
  ls -lhS /app/backups/*.dump.enc | head -20
```

### Tester un backup sans restaurer

```bash
# Déchiffrer et vérifier l'en-tête du dump
openssl enc -d -aes-256-cbc \
  -in /app/backups/vectura-production-2026-06-12T10-30-45.dump.enc \
  -k "$BACKUP_ENCRYPTION_PASSPHRASE" \
  -md sha256 | file -

# Résultat attendu: "data" ou "dump" (format custom PostgreSQL)
```

### Copier un backup vers une machine externe

```bash
# Depuis l'hôte:
docker compose -f docker-compose.prod.yml cp \
  backend-prod:/app/backups/vectura-production-2026-06-12T10-30-45.dump.enc \
  ./backup-2026-06-12.enc

# Vérifier l'intégrité
file backup-2026-06-12.enc
```

---

## Sécurité

### Points importants

1. **Passphrase forte**: Utiliser au moins 32 caractères alphanumériques + spéciaux
   ```bash
   openssl rand -base64 32  # Générer une passphrase aléatoire
   ```

2. **Stockage du passphrase**:
   - ❌ Ne PAS versionner dans Git
   - ✅ Stocker dans un gestionnaire de secrets (Vault, AWS Secrets Manager, etc.)
   - ✅ Passer via variable d'environnement `BACKUP_ENCRYPTION_PASSPHRASE`

3. **Permissions des fichiers**:
   ```bash
   # Les backups sont lisibles par l'utilisateur du conteneur
   # Sur l'hôte (via volume), vérifier les permissions:
   ls -la /var/lib/docker/volumes/prod_backups/_data/
   ```

4. **Isolation du réseau**: Le conteneur backend ne peut accéder qu'à postgres-prod et redis-prod

5. **Audit**: Chaque backup crée une entrée `BackupRun` horodatée dans Prisma

---

## Troubleshooting

### ❌ "Backup encryption failed: command not found"

**Cause**: `openssl` n'est pas installé dans le conteneur
**Solution**: Ajouter `openssl` à `backend/Dockerfile`:
```dockerfile
RUN apk add --no-cache openssl
```

### ❌ "pg_restore: command not found"

**Cause**: `pg_restore` n'est pas dans PATH
**Solution**: Installer PostgreSQL client:
```dockerfile
RUN apk add --no-cache postgresql-client
```

### ❌ "Backup cleanup failed" (dans logs)

**Cause**: Permissions insuffisantes sur le répertoire `/app/backups`
**Solution**: Le cleanup ne bloque pas le backup; vérifier les permissions du volume Docker

### ❌ "Restore failed: no such file or directory"

**Cause**: Le fichier `.dump.enc` n'existe pas
**Solution**: 
```bash
ls -la /app/backups/  # Lister les backups disponibles
```

### ❌ "Restore failed: wrong password"

**Cause**: Passphrase incorrecte
**Solution**: 
```bash
# Tester le déchiffrement:
openssl enc -d -aes-256-cbc \
  -in /app/backups/vectura-production-2026-06-12T10-30-45.dump.enc \
  -k "wrong-passphrase" \
  -out /dev/null
# Erreur "bad decrypt" = mauvaise passphrase
```

---

## Évolution future

- [ ] Compression Gzip avant chiffrement (réduire taille)
- [ ] Upload automatique vers S3/GCS (offsite backup)
- [ ] Webhook de notification après backup
- [ ] Dashboard de monitoring des backups
- [ ] Stratégie de rétention granulaire (weekly, monthly, yearly)
- [ ] Endpoint de test de restauration (disaster recovery drill)

---

## Références

- [PostgreSQL pg_dump docs](https://www.postgresql.org/docs/15/app-pgdump.html)
- [PostgreSQL pg_restore docs](https://www.postgresql.org/docs/15/app-pgrestore.html)
- [OpenSSL enc docs](https://www.openssl.org/docs/man1.1.1/man1/enc.html)
- [Prisma BackupRun model](../backend/prisma/schema.prisma)
