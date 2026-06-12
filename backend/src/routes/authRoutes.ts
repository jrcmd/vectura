import type { Application, NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { signAccess, signRefresh, verifyRefresh } from '../lib/jwt';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { verifyPassword } from '../lib/password';
import { createRateLimiter } from '../middleware/rateLimiter';
import { verifyAuthToken, type AuthenticatedUser } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function registerAuthRoutes(app: Application) {
  const authLimiter = createRateLimiter({ points: 5, duration: 15 * 60, keyPrefix: 'auth' });
  app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          status: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!user) {
        return res.status(401).json({ ok: false, message: 'Identifiants invalides' });
      }

      const passwordValid = await verifyPassword(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ ok: false, message: 'Identifiants invalides' });
      }

      const accessToken = signAccess({ sub: user.id, role: user.role, status: user.status });
      const refreshToken = signRefresh({ sub: user.id, type: 'refresh' });

      const refreshExpiresAt = new Date();
      const refreshDays = parseInt(process.env.REFRESH_TOKEN_DAYS ?? '7', 10);
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + refreshDays);
      await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiresAt } });

      return res.status(200).json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
        },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Champs invalides', errors: err.flatten() });
      }
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/auth/refresh', authLimiter, async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (!refreshToken) {
        return res.status(401).json({ ok: false, message: 'Refresh token manquant' });
      }

      let payload: { sub: string; type: string };
      try {
        payload = verifyRefresh(refreshToken) as { sub: string; type: string };
      } catch {
        return res.status(401).json({ ok: false, message: 'Refresh token invalide' });
      }

      if (payload.type !== 'refresh') {
        return res.status(401).json({ ok: false, message: 'Type de token invalide' });
      }

      const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, select: { id: true, userId: true, expiresAt: true } });

      if (!stored) {
        return res.status(401).json({ ok: false, message: 'Refresh token révoqué' });
      }

      if (stored.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: stored.id } });
        return res.status(401).json({ ok: false, message: 'Refresh token expiré' });
      }

      const user = await prisma.user.findUnique({ where: { id: stored.userId }, select: { id: true, email: true, role: true, status: true, firstName: true, lastName: true } });
      if (!user) {
        return res.status(401).json({ ok: false, message: 'Utilisateur introuvable' });
      }

      await prisma.refreshToken.delete({ where: { id: stored.id } });

      const newAccessToken = signAccess({ sub: user.id, role: user.role, status: user.status });
      const newRefreshToken = signRefresh({ sub: user.id, type: 'refresh' });

      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
      await prisma.refreshToken.create({ data: { token: newRefreshToken, userId: user.id, expiresAt: refreshExpiresAt } });

      return res.json({ ok: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
      }
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}

/**
 * Middleware qui vérifie que l'utilisateur a le rôle CHAUFFEUR.
 * Utilise la fonction verifyAuthToken centralisée.
 */
export async function requireDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await verifyAuthToken(req);

    if (user.role !== Role.CHAUFFEUR) {
      return res.status(403).json({ ok: false, message: 'Accès réservé aux chauffeurs' });
    }

    // Attache le driverId pour compatibilité ascendante
    (req as unknown as { driverId: string }).driverId = user.id;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TOKEN_INVALID';
    const status = message === 'TOKEN_MISSING' || message === 'TOKEN_INVALID' ? 401 : 403;
    res.status(status).json({ ok: false, message: message === 'TOKEN_MISSING' ? 'Token manquant' : message === 'TOKEN_INVALID' ? 'Token invalide' : 'Compte non autorisé' });
  }
}

