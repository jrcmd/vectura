# Guide développeur - Vectura

## Conventions de code

### Nommage

- Fichiers : kebab-case (`driver-profile.ts`)
- Variables/Fonctions : camelCase (`driverProfile`)
- Composants React : PascalCase (`DriverProfile.tsx`)
- Enums : SNAKE_CASE ou PascalCase selon contexte

### Structure backend

```
backend/src/
├── index.ts              # Entrée Express
├── server.ts             # Configuration serveur
├── routes/               # Routes Express
├── controllers/          # Logique métier
├── services/            # Services externes (email, géocodage)
├── middleware/            # Auth, validation, erreurs
├── prisma/
│   └── client.ts         # PrismaClient singleton
└── utils/
    └── errors.ts         # Classes d'erreur custom
```

### Structure frontend

```
frontend/src/
├── main.tsx              # Entrée React
├── App.tsx               # Routes principales
├── pages/                # Pages (Landing, Dashboard, etc)
├── components/           # Composants réutilisables
├── hooks/                # Hooks custom (useAuth, useApi)
├── services/             # Appels API (api.ts)
├── types/                # Types TypeScript
└── assets/               # Images, fonts
```

## Git

### Convention de branches

- `main` : Production
- `develop` : Développement
- `feature/nom-fonctionnalite` : Nouvelle fonctionnalité
- `hotfix/nom-bug` : Correction critique

### Commits

Format : `<type>(<scope>): <description>`

Types :
- `feat` : Nouvelle fonctionnalité
- `fix` : Bug
- `docs` : Documentation
- `style` : Formatage
- `refactor` : Refactorisation
- `test` : Tests

## Tests

### Backend (Jest)

```bash
npm run test              # Tous les tests
npm run test -- --watch    # Mode watch
npm run test file.test.ts  # Fichier spécifique
```

### Frontend (Vitest)

```bash
npm run test              # Tous les tests
npm run test -- --watch    # Mode watch
```

## Linting

```bash
npm run lint              # ESLint
npm run lint -- --fix     # Avec correction auto
npm run typecheck         # TypeScript strict
```

## Debugging

### Backend

```bash
# Mode debug
npm run dev

# Logs Pino
docker-compose logs -f backend

# Profiler
node --inspect node_modules/.bin/tsx src/index.ts
```

### Frontend

```bash
# React DevTools
npm run dev
# Ouvrir http://localhost:5173
```

## Sécurité

- Passwords hashés avec bcrypt (salt 12 rounds)
- JWT stocké en HttpOnly cookie + DB pour refresh
- CORS configuré pour origine frontend
- Rate limiting sur endpoints auth
- Validation Zod systématique des inputs
- File upload : type MIME + taille max