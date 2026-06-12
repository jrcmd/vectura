import type { Application, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { signAccess, signRefresh, verifyRefresh } from '../lib/jwt';
import { createRateLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { Role, UserStatus } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/password';



const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2).max(200),
  siret: z.string().max(14).optional(),
  address: z.string().max(500).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS ?? '7', 10);

export function registerCompanyAuthRoutes(app: Application) {
  app.post('/api/companies/register', async (req: Request, res: Response) => {
    try {
      const body = registerSchema.parse(req.body);

      const passwordHash = hashPassword(body.password);

      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: passwordHash,
          role: Role.ENTREPRISE,
          status: UserStatus.VALIDE,
          companyProfile: {
            create: {
              companyName: body.companyName,
              siret: body.siret ?? null,
              address: body.address ?? null,
            },
          },
        },
        select: { id: true, email: true, role: true, status: true },
      });

      return res.status(201).json({ ok: true, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Champs invalides', errors: err.flatten() });
      }
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        typeof (err as { code?: unknown }).code === 'string' &&
        (err as { code?: string }).code === 'P2002'
      ) {
        return res.status(409).json({ ok: false, message: 'Email déjà utilisé' });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  const authLimiter = createRateLimiter({ points: 5, duration: 15 * 60, keyPrefix: 'auth' });
  app.post('/api/companies/login', authLimiter, async (req: Request, res: Response) => {
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
          companyProfile: { select: { companyName: true, siret: true, address: true } },
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
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + REFRESH_DAYS);
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: refreshExpiresAt,
        },
      });

      return res.status(200).json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          companyName: user.companyProfile?.companyName ?? null,
        },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Champs invalides', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/companies/logout', async (_req: Request, res: Response) => res.json({ ok: true }));

  app.post('/api/companies/refresh', authLimiter, async (req: Request, res: Response) => {
    try {
      const refreshToken: string | undefined = (req.body as Record<string, string | undefined>)?.refreshToken;
      if (!refreshToken) {
        return res.status(400).json({ ok: false, message: 'refreshToken requis' });
      }

      const decoded = verifyRefresh(refreshToken) as { sub: string; type: string };

      if (decoded.type !== 'refresh') {
        return res.status(401).json({ ok: false, message: 'Type de token invalide' });
      }

      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      if (!stored || stored.expiresAt < new Date()) {
        return res.status(401).json({ ok: false, message: 'Token expiré ou révoqué' });
      }

      await prisma.refreshToken.delete({ where: { id: stored.id } });

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true, status: true, companyProfile: { select: { companyName: true } } },
      });
      if (!user || user.role !== Role.ENTREPRISE) {
        return res.status(401).json({ ok: false, message: 'Session invalide' });
      }

      const accessToken = signAccess({ sub: user.id, role: user.role, status: user.status });
      const newRefreshToken = signRefresh({ sub: user.id, type: 'refresh' });

      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + REFRESH_DAYS);
      await prisma.refreshToken.create({
        data: { token: newRefreshToken, userId: user.id, expiresAt: refreshExpiresAt },
      });

      return res.json({
        ok: true,
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          companyName: user.companyProfile?.companyName ?? null,
        },
      });
    } catch {
      return res.status(401).json({ ok: false, message: 'Token invalide' });
    }
  });
}

// local helpers are now in ../lib/jwt
