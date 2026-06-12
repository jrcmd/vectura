import type { Request, Response, NextFunction } from 'express';
import { Role, UserStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { verifyAccess } from '../lib/jwt';

/** Payload du JWT décodé */
export type JwtPayload = {
  sub: string;
  role: Role;
  status?: UserStatus;
};

/** Utilisateur authentifié */
export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
};

/**
 * Vérifie le JWT et retourne les infos utilisateur.
 * Lance une erreur si le token est manquant, invalide ou utilisateur suspendu.
 */
export async function verifyAuthToken(req: Request): Promise<AuthenticatedUser> {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new Error('TOKEN_MISSING');
  }

  const token = header.slice(7);

  let payload: JwtPayload;
  try {
    payload = verifyAccess(token) as JwtPayload;
  } catch {
    throw new Error('TOKEN_INVALID');
  }

  if (!payload.sub || !payload.role) {
    throw new Error('TOKEN_INVALID');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (user.status === UserStatus.SUSPENDU || user.status === UserStatus.RADIE) {
    throw new Error('ACCOUNT_SUSPENDED');
  }

  return user;
}

/**
 * Middleware d'authentification centralisé.
 * Vérifie le JWT, valide l'utilisateur et attache req.user.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await verifyAuthToken(req);
    (req as unknown as { user: AuthenticatedUser }).user = user;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TOKEN_INVALID';
    const status = message === 'TOKEN_MISSING' || message === 'TOKEN_INVALID' ? 401 : 403;
    res.status(status).json({ ok: false, message: message === 'TOKEN_MISSING' ? 'Token manquant' : message === 'TOKEN_INVALID' ? 'Token invalide' : 'Compte non autorisé' });
  }
}