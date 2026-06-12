// Valide les variables d'environnement critiques au démarrage
export function validateEnv(): void {
  const missing: string[] = [];

  const jwt = process.env.JWT_SECRET;
  const refresh = process.env.REFRESH_TOKEN_SECRET;

  if (!jwt || jwt.trim() === '' || jwt === 'change-me') missing.push('JWT_SECRET');
  if (!refresh || refresh.trim() === '' || refresh === 'change-me') missing.push('REFRESH_TOKEN_SECRET');

  if (missing.length > 0) {
    // Log explicite et arrêt du process pour éviter un démarrage non sécurisé
    // (on veut une erreur visible en CI / prod plutôt qu'un fallback silencieux)
    // eslint-disable-next-line no-console
    console.error('[ENV] Variables d\'environnement manquantes ou non sécurisées:', missing.join(', '));
    // Terminate process with failure code
    process.exit(1);
  }
}

// Exports sûrs pour être utilisés dans l'application sans fallback
export const JWT_SECRET = process.env.JWT_SECRET!;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
