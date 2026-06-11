# FAQ - Vectura

## Développement

### Comment démarrer le projet en local ?

```bash
cp .env.example .env
docker-compose up -d
cd backend && npm install && npm run prisma:generate
cd ../frontend && npm install
```

### L'API ne répond pas, que faire ?

1. Vérifier que Docker est lancé
2. Vérifier les logs : `docker-compose logs backend`
3. Vérifier que PostgreSQL est accessible : `docker-compose logs postgres`

### Comment reset la base de données ?

```bash
cd backend
npx prisma db push --force-reset
npx prisma db seed
```

## Business

### Quel est le tarif minimum pour une mission PL ?

25€/heure. La création échoue si le tarif est inférieur.

### Quel est le tarif minimum pour une mission SPL ?

30€/heure. La création échoue si le tarif est inférieur.

### Comment ça marche la priorité favoris ?

- L'entreprise peut cocher "priorité favoris" (2h)
- Pendant 2h, seuls les favoris qualifiés voient la mission
- Après 2h, diffusion ouverte à tous les chauffeurs compatibles

### Quelles sanctions pour une annulation tardive ?

- Annulation ≤ H-24 : sanction automatique +1 suspension 7j
- À la 3ème annulation tardive : radiation définitive

## Techniques

### Où sont stockés les fichiers uploadés ?

- Dev : dossier `./uploads` monté dans le conteneur
- Prod : bucket S3-compatible (à configurer)

### Comment vérifier les logs d'erreur ?

```bash
docker-compose logs -f backend
# Les logs Pino sont en JSON
```

### Comment ajouter une nouvelle variable d'environnement ?

1. Ajouter dans `.env.example`
2. Référencer dans `docker-compose.yml` (backend environment)
3. Utiliser `process.env.NOM_VARIABLE` dans le code
4. Ajouter le type dans `backend/src/types/env.d.ts`