import type { Application, NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { verifyPassword } from '../lib/password';



const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function registerAuthRoutes(app: Application) {
  app.post('/api/auth/login', async (req: Request, res: Response) => {
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

      const accessToken = jwt.sign(
        { sub: user.id, role: user.role, status: user.status },
        process.env.JWT_SECRET ?? 'change-me',
        { expiresIn: (process.env.JWT_ACCESS_EXPIRATION ?? '15m') as unknown as jwt.SignOptions['expiresIn'] },
      );

      const expiresIn = (process.env.JWT_REFRESH_EXPIRATION ?? '7d') as unknown as jwt.SignOptions['expiresIn'];

      const refreshToken = jwt.sign(
        { sub: user.id, type: 'refresh' },
        process.env.JWT_SECRET ?? 'change-me',
        { expiresIn },
      );

      // Persist refresh token for revocation support
      const refreshExpiresAt = new Date();
      const refreshDays = parseInt(process.env.REFRESH_TOKEN_DAYS ?? '7', 10);
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + refreshDays);
      await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiresAt },
      });

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

  // ── Refresh token endpoint ──────────────────────────────────────────────────
  app.post('/api/auth/refresh', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      if (!refreshToken) {
        return res.status(401).json({ ok: false, message: 'Refresh token manquant' });
      }

      let payload: { sub: string; type: string };
      try {
        payload = jwt.verify(
          refreshToken,
          process.env.JWT_SECRET ?? 'change-me',
        ) as { sub: string; type: string };
      } catch {
        return res.status(401).json({ ok: false, message: 'Refresh token invalide' });
      }

      if (payload.type !== 'refresh') {
        return res.status(401).json({ ok: false, message: 'Type de token invalide' });
      }

      // Verify token exists in DB (revocation check)
      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        select: { id: true, userId: true, expiresAt: true },
      });

      if (!stored) {
        return res.status(401).json({ ok: false, message: 'Refresh token révoqué' });
      }

      if (stored.expiresAt < new Date()) {
        // Clean up stale entry
        await prisma.refreshToken.delete({ where: { id: stored.id } });
        return res.status(401).json({ ok: false, message: 'Refresh token expiré' });
      }

      // Fetch user to build the new access token
      const user = await prisma.user.findUnique({
        where: { id: stored.userId },
        select: { id: true, email: true, role: true, status: true, firstName: true, lastName: true },
      });

      if (!user) {
        return res.status(401).json({ ok: false, message: 'Utilisateur introuvable' });
      }

      // Token rotation: invalidate old refresh token, issue new pair
      await prisma.refreshToken.delete({ where: { id: stored.id } });

      const newAccessToken = jwt.sign(
        { sub: user.id, role: user.role, status: user.status },
        process.env.JWT_SECRET ?? 'change-me',
        { expiresIn: (process.env.JWT_ACCESS_EXPIRATION ?? '15m') as unknown as jwt.SignOptions['expiresIn'] },
      );

      const newRefreshToken = jwt.sign(
        { sub: user.id, type: 'refresh' },
        process.env.JWT_SECRET ?? 'change-me',
        { expiresIn: (process.env.JWT_REFRESH_EXPIRATION ?? '7d') as unknown as jwt.SignOptions['expiresIn'] },
      );

      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
      await prisma.refreshToken.create({
        data: { token: newRefreshToken, userId: user.id, expiresAt: refreshExpiresAt },
      });

      return res.json({
        ok: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  // ── Auth logout (revoke the provided refresh token) ─────────────────────────
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

export function requireDriver(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token manquant' });
  }

  const token = header.slice(7);

  let payload: { sub: string; role: Role };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET ?? 'change-me') as {
      sub: string;
      role: Role;
    };
  } catch {
    return res.status(401).json({ ok: false, message: 'Token invalide' });
  }

  if (payload.role !== Role.CHAUFFEUR) {
    return res.status(403).json({ ok: false, message: 'Accès réservé aux chauffeurs' });
  }

  (req as unknown as { driverId: string }).driverId = payload.sub;
  next();
}
