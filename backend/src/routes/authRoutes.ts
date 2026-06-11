import type { Application, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient, Role, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

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

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ ok: false, message: 'Identifiants invalides' });
      }

      const accessToken = jwt.sign(
        { sub: user.id, role: user.role, status: user.status },
        process.env.JWT_SECRET ?? 'change-me',
        { expiresIn: (process.env.JWT_ACCESS_EXPIRATION ?? '15m') as unknown as jwt.SignOptions['expiresIn'] },
      );

      const refreshToken = jwt.sign(
        { sub: user.id, type: 'refresh' },
        process.env.JWT_SECRET ?? 'change-me',
        { expiresIn: (process.env.JWT_REFRESH_EXPIRATION ?? '7d') as unknown as jwt.SignOptions['expiresIn'] },
      );

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
}

export function requireDriver(req: Request, res: Response, next: () => void) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token manquant' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'change-me') as {
      sub: string;
      role: Role;
      status: UserStatus;
    };

    if (payload.role !== Role.CHAUFFEUR) {
      return res.status(403).json({ ok: false, message: 'Accès réservé aux chauffeurs' });
    }

    if (payload.status === UserStatus.SUSPENDU || payload.status === UserStatus.RADIE) {
      return res.status(403).json({ ok: false, message: 'Compte non autorisé' });
    }

    (req as unknown as { driverId: string }).driverId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Token invalide' });
  }
}
