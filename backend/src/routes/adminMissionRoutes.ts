import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, MissionStatus } from '@prisma/client';
import { requireAdmin } from '../middleware/requireAdmin';
import { sendMail } from '../services/mailService';

const prisma = new PrismaClient();

const missionQuerySchema = z.object({
  status: z.enum(['OUVERTE', 'POURVUE', 'TERMINEE', 'ANNULEE']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  driverId: z.string().optional(),
});

type MissionWhereInput = {
  status?: MissionStatus;
  missionDate?: { gte?: Date; lte?: Date };
  driverId?: string;
};

export function registerAdminMissionRoutes(app: Application) {
  app.get('/api/admin/missions', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = missionQuerySchema.parse(req.query);
      const where: MissionWhereInput = {};

      if (query.status) where.status = query.status;
      if (query.from || query.to) {
        where.missionDate = {};
        if (query.from) where.missionDate.gte = new Date(query.from);
        if (query.to) where.missionDate.lte = new Date(query.to);
      }
      if (query.driverId) where.driverId = query.driverId;

      const [openMissions, assignedMissions, pastMissions] = await Promise.all([
        prisma.mission.count({ where: { ...where, status: MissionStatus.OUVERTE } }),
        prisma.mission.count({ where: { ...where, status: MissionStatus.POURVUE } }),
        prisma.mission.count({ where: { ...where, status: { in: [MissionStatus.TERMINEE, MissionStatus.ANNULEE] } } }),
      ]);

      return res.status(200).json({
        ok: true,
        counts: {
          open: openMissions,
          assigned: assignedMissions,
          past: pastMissions,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/admin/compliance/urssaf', requireAdmin, async (req: Request, res: Response) => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const drivers = await prisma.user.findMany({
        where: { role: 'CHAUFFEUR' },
        include: {
          documents: {
            where: { type: 'URSSAF' },
          },
        },
      });

      const nonCompliant = drivers
        .filter((d) => {
          const urssaf = d.documents.find((doc) => doc.type === 'URSSAF');
          if (!urssaf) return true;
          if (urssaf.expiryDate && urssaf.expiryDate < sixMonthsAgo) return true;
          return false;
        })
        .map((d) => ({
          id: d.id,
          firstName: d.firstName,
          lastName: d.lastName,
          email: d.email,
        }));

      return res.status(200).json({ ok: true, nonCompliant });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/admin/compliance/urssaf/remind', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { driverId } = z.object({ driverId: z.string().min(1) }).parse(req.body);

      const driver = await prisma.user.findUnique({
        where: { id: driverId },
        select: { id: true, email: true, firstName: true, lastName: true },
      });

      if (!driver) {
        return res.status(404).json({ ok: false, message: 'Chauffeur introuvable' });
      }

      await sendMail({
        to: driver.email,
        subject: 'Relance : votre attestation URSSAF',
        text: `Bonjour ${driver.firstName ?? ''}, votre attestation URSSAF est périmée. Merci de la renouveler.`,
      });

      await prisma.notificationLog.create({
        data: {
          type: 'URSSAF_REMINDER',
          recipientId: driver.id,
          email: driver.email,
          subject: 'Relance : votre attestation URSSAF',
          status: 'sent',
        },
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
