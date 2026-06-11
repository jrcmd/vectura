import type { Application, Request, Response } from 'express';
import { PrismaClient, MissionStatus, UserStatus, DocStatus } from '@prisma/client';
import { requireAdmin } from '../middleware/requireAdmin';

const prisma = new PrismaClient();

export function registerAdminRoutes(app: Application) {
  app.get('/api/admin/kpis', requireAdmin, async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const [
        activeMissionsCount,
        pendingDriversCount,
        expiringDocumentsCount,
        weeklyRevenue,
      ] = await Promise.all([
        prisma.mission.count({ where: { status: MissionStatus.POURVUE, missionDate: { gte: now } } }),
        prisma.user.count({ where: { role: 'CHAUFFEUR', status: UserStatus.EN_ATTENTE } }),
        prisma.document.count({ where: { expiryDate: { lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }, status: DocStatus.VALIDE } }),
        prisma.mission.aggregate({
          where: { status: MissionStatus.TERMINEE, missionDate: { gte: weekStart } },
          _sum: { hourlyRate: true },
        }),
      ]);

      return res.status(200).json({
        ok: true,
        kpis: {
          activeMissions: activeMissionsCount,
          pendingDrivers: pendingDriversCount,
          expiringDocuments: expiringDocumentsCount,
          weeklyRevenue: weeklyRevenue._sum.hourlyRate ?? 0,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
