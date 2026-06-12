# Priorité 8 : Centraliser la vérification JWT/RBAC

## Fichiers créés/modifiés

### Nouveau fichier : `backend/src/middleware/auth.ts`
Middleware d'authentification centralisé qui :
- Exporte `verifyAuthToken(req)` - fonction utilitaire qui vérifie le JWT et retourne `{ id, email, role, status }`
- Exporte `authenticate` - middleware Express qui attache `req.user`
- Exporte les types `JwtPayload` et `AuthenticatedUser`

### Nouveau fichier : `backend/src/middleware/authorize.ts`
Fonctions utilitaires pour l'autorisation :
- `authorize(roles: Role[])` - middleware générique de vérification de rôles (à utiliser APRES authenticate)
- `requireAdminRole`, `requireCompanyRole`, `requireDriverRole` - raccourcis

### Fichiers modifiés
- `backend/src/middleware/requireAdmin.ts` - refactor pour utiliser `verifyAuthToken` centralisé
- `backend/src/middleware/requireCompany.ts` - refactor pour utiliser `verifyAuthToken` centralisé  
- `backend/src/routes/authRoutes.ts` - `requireDriver` refactor pour utiliser `verifyAuthToken` centralisé

## Architecture
```
verifyAuthToken() -> vérifie JWT + user status -> retourne AuthenticatedUser
     ↓
requireAdmin/requireCompany/requireDriver -> vérif role + attache ID
     ↓
handler route
```

## Vérifications
- `npm run type-check` : OK
- `npm test --silent` : 6 suites, 41 tests passés