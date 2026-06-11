import type { Application, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

const TOKEN_EXPIRY_MS = 1000 * 60 * 30;

export function registerPasswordResetRoutes(app: Application) {
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = forgotSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(200).json({ ok: true });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await prisma.resetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Email invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, password } = resetSchema.parse(req.body);

      const record = await prisma.resetToken.findUnique({ where: { token } });
      if (!record || record.expiresAt < new Date() || record.usedAt) {
        return res.status(400).json({ ok: false, message: 'Lien invalide ou expiré.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: record.userId },
          data: { password: passwordHash },
        }),
        prisma.resetToken.update({
          where: { token },
          data: { usedAt: new Date() },
        }),
      ]);

      return res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Données invalides', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
