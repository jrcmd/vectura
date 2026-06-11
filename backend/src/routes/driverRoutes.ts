import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, DocStatus, DocType, MissionStatus, UserStatus, SanctionType } from '@prisma/client';
import { requireDriver } from './authRoutes';
import { findCompatibleMissions } from '../services/matchingService';

const prisma = new PrismaClient();

const acceptMissionSchema = z.object({ missionId: z.string().min(1) });
const cancelMissionSchema = z.object({ missionId: z.string().min(1), reason: z.string().max(500).optional() });

export function registerDriverRoutes(app: Application) {
  app.get('/api/driver/me', requireDriver, async (req: Request, res: Response) => {
    const driverId = (req as unknown as { driverId: string }).driverId;

    const user = await prisma.user.findUnique({
      where: { id: driverId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        city: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ ok: false, message: 'Utilisateur introuvable' });
    }

    return res.status(200).json({ ok: true, user });
  });

  app.get('/api/driver/documents', requireDriver, async (req: Request, res: Response) => {
    const driverId = (req as unknown as { driverId: string }).driverId;

    const documents = await prisma.document.findMany({
      where: { userId: driverId },
      orderBy: { type: 'asc' },
      select: {
        id: true,
        type: true,
        fileUrl: true,
        expiryDate: true,
        status: true,
        uploadedAt: true,
        validatedAt: true,
        rejectionReason: true,
      },
    });

    const allRequiredTypes: DocType[] = [
      DocType.PERMIS_C,
      DocType.PERMIS_CE,
      DocType.FIMO,
      DocType.FCO,
      DocType.CARTE_CHRONO,
      DocType.KBIS,
      DocType.URSSAF,
      DocType.RC_PRO,
    ];

    const statusByType = new Map<string, { status: DocStatus; fileUrl: string | null; expiryDate: Date | null }>();
    for (const d of documents) {
      statusByType.set(d.type, { status: d.status, fileUrl: d.fileUrl, expiryDate: d.expiryDate });
    }

    const list = allRequiredTypes.map((type) => {
      const found = statusByType.get(type);
      return {
        type,
        status: found?.status ?? DocStatus.EN_ATTENTE,
        fileUrl: found?.fileUrl ?? null,
        expiryDate: found?.expiryDate ?? null,
      };
    });

    return res.status(200).json({ ok: true, documents: list });
  });

  app.get('/api/driver/missions', requireDriver, async (req: Request, res: Response) => {
    try {
      const driverId = (req as unknown as { driverId: string }).driverId;
      const query = z.object({ type: z.enum(['available', 'active', 'past']).optional().default('available') }).parse(req.query);
      const listType = query.type;

      const driver = await prisma.user.findUnique({
        where: { id: driverId },
        select: { status: true },
      });

      if (!driver) {
        return res.status(404).json({ ok: false, message: 'Utilisateur introuvable' });
      }

      if (driver.status === UserStatus.EN_ATTENTE || driver.status === UserStatus.SUSPENDU || driver.status === UserStatus.RADIE) {
        return res.status(403).json({ ok: false, message: 'Compte non autorisé à consulter les missions.' });
      }

      const now = new Date();

      if (listType === 'active') {
        const activeMissions = await prisma.mission.findMany({
          where: { driverId, status: MissionStatus.POURVUE, missionDate: { gte: now } },
          orderBy: { missionDate: 'asc' },
          select: { id: true, title: true, description: true, location: true, missionDate: true, startTime: true, endTime: true, truckType: true, hourlyRate: true, status: true, createdAt: true },
        });
        return res.status(200).json({ ok: true, missions: activeMissions });
      }

      if (listType === 'past') {
        const pastMissions = await prisma.mission.findMany({
          where: { driverId, OR: [{ status: MissionStatus.TERMINEE }, { status: MissionStatus.ANNULEE }], missionDate: { lt: now } },
          orderBy: { missionDate: 'desc' },
          select: { id: true, title: true, description: true, location: true, missionDate: true, startTime: true, endTime: true, truckType: true, hourlyRate: true, status: true, createdAt: true },
        });
        return res.status(200).json({ ok: true, missions: pastMissions });
      }

      if (listType === 'available') {
        const missions = await findCompatibleMissions(driverId);
        return res.status(200).json({ ok: true, missions });
      }

      return res.status(400).json({ ok: false, message: 'Type de liste invalide' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/driver/missions/:id', requireDriver, async (req: Request, res: Response) => {
    const { id } = req.params;

    const mission = await prisma.mission.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        latitude: true,
        longitude: true,
        missionDate: true,
        startTime: true,
        endTime: true,
        truckType: true,
        hourlyRate: true,
        status: true,
        createdAt: true,
        acceptedAt: true,
        driverId: true,
      },
    });

    if (!mission) {
      return res.status(404).json({ ok: false, message: 'Mission introuvable' });
    }

    return res.status(200).json({ ok: true, mission });
  });

  app.post('/api/driver/missions/:id/accept', requireDriver, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { missionId } = acceptMissionSchema.parse({ missionId: id });
      const driverId = (req as unknown as { driverId: string }).driverId;

      const mission = await prisma.mission.findUnique({ where: { id: missionId } });
      if (!mission) {
        return res.status(404).json({ ok: false, message: 'Mission introuvable' });
      }

      if (mission.status !== MissionStatus.OUVERTE) {
        return res.status(400).json({ ok: false, message: 'Mission non disponible' });
      }

      const missionDate = mission.missionDate;
      if (missionDate.getTime() <= Date.now()) {
        return res.status(400).json({ ok: false, message: 'Mission déjà passée' });
      }

      const updated = await prisma.mission.update({
        where: { id: missionId },
        data: {
          status: MissionStatus.POURVUE,
          driverId,
          assignedAt: new Date(),
          acceptedAt: new Date(),
        },
        select: {
          id: true,
          status: true,
          driverId: true,
          assignedAt: true,
        },
      });

      await prisma.missionStatusHistory.create({
        data: {
          missionId: updated.id,
          status: MissionStatus.POURVUE,
          changedBy: driverId,
          reason: 'ACCEPTED_BY_DRIVER',
        },
      });

      return res.status(200).json({ ok: true, mission: updated });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }

      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/driver/missions/:id/cancel', requireDriver, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { missionId, reason } = cancelMissionSchema.parse({ missionId: id, reason: req.body?.reason });
      const driverId = (req as unknown as { driverId: string }).driverId;

      const mission = await prisma.mission.findUnique({ where: { id: missionId } });
      if (!mission) {
        return res.status(404).json({ ok: false, message: 'Mission introuvable' });
      }

      if (mission.status !== MissionStatus.POURVUE || mission.driverId !== driverId) {
        return res.status(400).json({ ok: false, message: 'Annulation impossible' });
      }

      const cutoff = new Date(mission.missionDate.getTime() - 24 * 60 * 60 * 1000);
      const now = new Date();
      const isLate = now > cutoff;

      const updated = await prisma.mission.update({
        where: { id: missionId },
        data: {
          status: MissionStatus.ANNULEE,
          driverId: null,
          assignedAt: null,
          acceptedAt: null,
        },
        select: {
          id: true,
          status: true,
          driverId: true,
        },
      });

      await prisma.cancellation.create({
        data: {
          missionId: updated.id,
          driverId,
          isLate,
          reason: reason ?? null,
        },
      });

      if (isLate) {
        const driver = await prisma.user.findUnique({ where: { id: driverId }, select: { status: true, driverProfile: { select: { lateCancellationCount: true } } } });
        if (driver) {
          const newCount = (driver.driverProfile?.lateCancellationCount ?? 0) + 1;
          const shouldBan = newCount >= 3;

          await prisma.$transaction([
            prisma.driverProfile.update({
              where: { userId: driverId },
              data: { lateCancellationCount: newCount },
            }),
            shouldBan
              ? prisma.user.update({
                  where: { id: driverId },
                  data: { status: UserStatus.RADIE },
                })
              : prisma.user.update({
                  where: { id: driverId },
                  data: { status: shouldBan ? UserStatus.RADIE : UserStatus.SUSPENDU },
                }),
            prisma.sanction.create({
              data: {
                driverId,
                type: shouldBan ? SanctionType.RADIATION : SanctionType.SUSPENSION,
                reason: shouldBan ? 'Troisième annulation tardive' : 'Annulation tardive',
                missionId: updated.id,
              },
            }),
          ]);
        }
      }

      await prisma.missionStatusHistory.create({
        data: {
          missionId: updated.id,
          status: MissionStatus.ANNULEE,
          changedBy: driverId,
          reason: isLate ? 'LATE_CANCELLATION' : 'CANCELLED_BY_DRIVER',
        },
      });

      return res.status(200).json({ ok: true, mission: updated, isLate });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
