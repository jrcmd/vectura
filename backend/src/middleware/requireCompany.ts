import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyAuthToken } from './auth';

/**
 * Middleware qui vérifie que l'utilisateur a le rôle ENTREPRISE et que son compte est actif.
 * Utilise la fonction verifyAuthToken centralisée.
 */
export async function requireCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await verifyAuthToken(req);

    if (user.role !== Role.ENTREPRISE) {
      return res.status(403).json({ ok: false, message: 'Accès réservé aux entreprises' });
    }

    // Attache le companyId pour compatibilité ascendante
    (req as unknown as { companyId: string }).companyId = user.id;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TOKEN_INVALID';
    const status = message === 'TOKEN_MISSING' || message === 'TOKEN_INVALID' ? 401 : 403;
    res.status(status).json({ ok: false, message: message === 'TOKEN_MISSING' ? 'Token manquant' : message === 'TOKEN_INVALID' ? 'Token invalide' : 'Compte non autorisé' });
  }
}