import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { Role, UserStatus } from '@prisma/client';
import { hashPassword } from '../lib/password';
import { acceptEnrollmentInvitationSchema } from '../schemas/sms';

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me';

function signAccess(sub: string, role: Role, status: UserStatus) {
  return jwt.sign(
    { sub, role, status },
    JWT_SECRET,
    { expiresIn: (process.env.JWT_ACCESS_EXPIRATION ?? '15m') as unknown as jwt.SignOptions['expiresIn'] },
  );
}

function signRefresh(sub: string) {
  return jwt.sign(
    { sub, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRATION ?? '7d') as unknown as jwt.SignOptions['expiresIn'] },
  );
}

export function registerEnrollmentRoutes(app: Application) {
  app.post('/api/enrollment/accept', async (req: Request, res: Response) => {
    try {
      const { invitationId, password, firstName, lastName } = acceptEnrollmentInvitationSchema.parse(req.body);

      const invitation = await prisma.enrollmentInvitation.findUnique({
        where: { invitationId },
      });

      if (!invitation) {
        return res.status(404).json({ ok: false, message: 'Invitation introuvable' });
      }

      if (invitation.status === 'ACCEPTED') {
        return res.status(400).json({ ok: false, message: 'Cette invitation a déjà été utilisée.' });
      }

      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        await prisma.enrollmentInvitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
        return res.status(400).json({ ok: false, message: 'Cette invitation a expiré.' });
      }

      const passwordHash = hashPassword(password);

      // Use phone-based email placeholder since enrollment users have no email yet
      const phoneEmail = `sms-${invitation.phoneNumber.replace(/\D/g, '')}@vectura.invite`;

      const user = await prisma.user.create({
        data: {
          email: phoneEmail,
          password: passwordHash,
          role: Role.CHAUFFEUR,
          status: UserStatus.EN_ATTENTE,
          phone: invitation.phoneNumber,
          firstName: firstName ?? invitation.firstName,
          lastName: lastName ?? invitation.lastName,
          driverProfile: {
            create: {
              hasPermisC: false,
              hasPermisCE: false,
              hasADR: false,
              hasFrigo: false,
              lateCancellationCount: 0,
              qualificationsValid: false,
            },
          },
        },
        select: { id: true, email: true, role: true, status: true },
      });

      await prisma.enrollmentInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });

      const accessToken = signAccess(user.id, user.role, user.status);
      const refreshToken = signRefresh(user.id);

      const refreshExpiresAt = new Date();
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
      await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiresAt },
      });

      return res.status(201).json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          firstName: firstName ?? invitation.firstName,
          lastName: lastName ?? invitation.lastName,
        },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
