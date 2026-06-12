import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from './auth';

/**
 * Middleware d'autorisation basé sur les rôles.
 * À utiliser APRÈS le middleware authenticate().
 * @param allowedRoles - Liste des rôles autorisés à accéder à la ressource
 */
export function authorize(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as unknown as { user: AuthenticatedUser }).user;

    if (!user) {
      return res.status(401).json({ ok: false, message: 'Authentification requise' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ ok: false, message: 'Accès interdit à ce rôle' });
    }

    next();
  };
}

/** Middleware raccourci pour exiger le rôle ADMIN */
export const requireAdminRole = authorize([Role.ADMIN]);

/** Middleware raccourci pour exiger le rôle ENTREPRISE */
export const requireCompanyRole = authorize([Role.ENTREPRISE]);

/** Middleware raccourci pour exiger le rôle CHAUFFEUR */
export const requireDriverRole = authorize([Role.CHAUFFEUR]);