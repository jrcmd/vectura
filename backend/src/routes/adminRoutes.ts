import type { Application, Request, Response } from 'express';
import { MissionStatus, UserStatus, DocStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/requireAdmin';

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

  app.get('/api/admin/sanctions', requireAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt((req.query.page as string) ?? '1', 10);
      const limit = parseInt((req.query.limit as string) ?? '20', 10);
      const skip = (page - 1) * limit;

      const [sanctions, total] = await Promise.all([
        prisma.sanction.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            driver: {
              select: { id: true, firstName: true, lastName: true, email: true, status: true },
            },
          },
        }),
        prisma.sanction.count(),
      ]);

      const sanctionsWithMission = await Promise.all(
        sanctions.map(async (s) => ({
          ...s,
          missionId: s.missionId,
        })),
      );

      return res.status(200).json({
        ok: true,
        sanctions: sanctionsWithMission,
        total,
        page,
        limit,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
