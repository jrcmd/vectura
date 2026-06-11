# API - Vectura

## Conventions REST

| Méthode | Usage |
|---------|-------|
| GET | Récupérer une ressource |
| POST | Créer une ressource |
| PUT | Mettre à jour complètement |
| PATCH | Mettre à jour partiellement |
| DELETE | Supprimer une ressource |

## Authentification

### Header requis

```
Authorization: Bearer <access_token>
```

### Tokens

- Access token : 15 minutes (configurable via `JWT_ACCESS_EXPIRATION`)
- Refresh token : 7 jours (configurable via `JWT_REFRESH_EXPIRATION`)
- Refresh stocké en base lié à l'utilisateur

## Endpoints publics

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/register` | Inscription chauffeur |
| POST | `/api/login` | Connexion (chauffeur/entreprise) |

## Endpoints chauffeur (auth requis)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/missions` | Liste des missions compatibles |
| POST | `/api/missions/:id/accept` | Accepter une mission |
| POST | `/api/missions/:id/cancel` | Annuler une mission |
| GET | `/api/profile` | Profil du chauffeur |
| PUT | `/api/profile` | Mettre à jour le profil |
| POST | `/api/documents` | Upload document |
| GET | `/api/documents` | Liste des documents |

## Endpoints entreprise (auth requis)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/missions` | Créer une mission |
| GET | `/api/missions/company` | Missions de l'entreprise |
| GET | `/api/invoices` | Factures hebdomadaires |
| GET | `/api/invoices/:id/pdf` | Télécharger facture PDF |
| POST | `/api/favorites` | Ajouter un favori |
| GET | `/api/favorites` | Liste des favoris |

## Endpoints admin (auth requis + rôle ADMIN)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/drivers` | Liste des chauffeurs |
| PATCH | `/api/admin/documents/:id/validate` | Valider document |
| PATCH | `/api/admin/documents/:id/reject` | Rejeter document |
| GET | `/api/admin/missions` | Toutes les missions |
| GET | `/api/admin/invoices` | Export factures |
| GET | `/api/admin/compliance` | Suivi conformité URSSAF |

## Schémas de validation (Zod)

### Inscription chauffeur

```typescript
{
  email: string.email(),
  password: string.min(8),
  firstName: string.min(2).max(50),
  lastName: string.min(2).max(50),
  phone: string.regex(/^0[1-9][0-9]{8}$/),
  city: string.min(2)
}
```

### Création mission

```typescript
{
  title: string.min(5),
  description: string.optional(),
  location: string.min(5),
  missionDate: date.future(),
  startTime: string.time(),
  endTime: string.time().optional(),
  truckType: enum(PL, SPL, ADR, FRIGO),
  hourlyRate: number.min(25) // PL ou 30 pour SPL
}
```

## Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Validation échouée |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Rôle insuffisant |
| 404 | Not Found | Ressource inexistante |
| 409 | Conflict | Conflit (ex: email déjà utilisé) |
| 500 | Internal Server Error | Erreur serveur |