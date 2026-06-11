import type { Application, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient, Role, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

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

export function registerCompanyAuthRoutes(app: Application) {
  app.post('/api/companies/register', async (req: Request, res: Response) => {
    try {
      const body = registerSchema.parse(req.body);

      const passwordHash = await bcrypt.hash(body.password, 12);

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

  app.post('/api/companies/login', async (req: Request, res: Response) => {
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

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ ok: false, message: 'Identifiants invalides' });
      }

      const accessToken = jwtSign(user.id, user.role, user.status);
      const refreshToken = jwtSignRefresh(user.id);

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
}

function jwtSign(sub: string, role: string, status: string) {
  const secret = process.env.JWT_SECRET ?? 'change-me';
  return jwt.sign({ sub, role, status }, secret, { expiresIn: (process.env.JWT_ACCESS_EXPIRATION ?? '15m') as unknown as jwt.SignOptions['expiresIn'] });
}

function jwtSignRefresh(sub: string) {
  const secret = process.env.JWT_SECRET ?? 'change-me';
  return jwt.sign({ sub, type: 'refresh' }, secret, { expiresIn: (process.env.JWT_REFRESH_EXPIRATION ?? '7d') as unknown as jwt.SignOptions['expiresIn'] });
}
