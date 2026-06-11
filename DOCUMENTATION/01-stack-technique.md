# Stack technique - Vectura

## Frontend

| Technologie | Version | Description |
|-------------|---------|-------------|
| React | 18.3.1 | Bibliothèque UI (NOTE: TODO.md mentionne React 19) |
| TypeScript | 5.5.4 | Typage strict |
| Vite | 5.4.2 | Build tool et dev server |
| Tailwind CSS | 3.4.10 | Styling utility-first |
| shadcn/ui | - | Composants UI (à implémenter) |
| React Router | 6.26.2 | Routing SPA |

## Backend

| Technologie | Version | Description |
|-------------|---------|-------------|
| Node.js | 20-alpine | Runtime JavaScript |
| Express | 4.19.2 | Framework web |
| TypeScript | 5.5.4 | Typage strict |
| Prisma ORM | 5.20.0 | ORM PostgreSQL |
| PostgreSQL | 15 | Base de données principale |
| Redis | 7 | Cache et jobs |
| JWT | 9.0.2 | Authentification stateless |
| bcrypt | 5.1.1 | Hashage mots de passe |
| Multer | 1.4.5 | Upload fichiers |
| Nodemailer | - | Envoi emails |
| node-cron | 3.0.3 | Jobs planifiés |
| Zod | 3.23.8 | Validation schema |

## Infrastructure

| Composant | Technologie | Description |
|-----------|-------------|-------------|
| Containerisation | Docker Compose | Orchestration services |
| Reverse proxy | - | À définir (Traefik/Nginx) |
| Stockage fichiers | Local (dev) / S3 (prod) | Uploads documents |
| SMTP | SendGrid (exemple) | Emails transactionnels |
| CI/CD | GitHub Actions | Pipelines lint/test/build |