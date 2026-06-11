import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, TruckType, MissionStatus } from '@prisma/client';
import { requireCompany } from '../middleware/requireCompany';

const prisma = new PrismaClient();

const createMissionSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().min(2).max(500),
  missionDate: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  truckType: z.nativeEnum(TruckType),
  hourlyRate: z.coerce.number().positive(),
  favoritePriorityHours: z.coerce.number().int().nonnegative().optional().nullable(),
});

const MIN_RATES: Record<TruckType, number> = {
  PL: 25,
  SPL: 30,
  ADR: 35,
  FRIGO: 35,
};

export function registerCompanyRoutes(app: Application) {
  app.get('/api/companies/me', requireCompany, async (req: Request, res: Response) => {
    const companyId = (req as unknown as { companyId: string }).companyId;

    const user = await prisma.user.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        companyProfile: { select: { companyName: true, siret: true, address: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ ok: false, message: 'Entreprise introuvable' });
    }

    return res.status(200).json({ ok: true, company: user });
  });

  app.post('/api/companies/missions', requireCompany, async (req: Request, res: Response) => {
    try {
      const body = createMissionSchema.parse(req.body);

      const minRate = MIN_RATES[body.truckType];
      if (body.hourlyRate < minRate) {
        return res.status(400).json({ ok: false, message: `Taux horaire trop bas pour ${body.truckType} (minimum ${minRate} €/h)` });
      }

      const companyId = (req as unknown as { companyId: string }).companyId;

      const priorityHours = body.favoritePriorityHours ?? 0;
      const mission = await prisma.mission.create({
        data: {
          title: body.title,
          description: body.description ?? null,
          location: body.location,
          missionDate: new Date(body.missionDate),
          startTime: body.startTime,
          endTime: body.endTime ?? null,
          truckType: body.truckType,
          hourlyRate: body.hourlyRate,
          creatorId: companyId,
          status: MissionStatus.OUVERTE,
          favoritePriorityHours: priorityHours,
          favoritePriorityStart: priorityHours > 0 ? new Date() : null,
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          favoritePriorityHours: true,
          favoritePriorityStart: true,
        },
      });

      return res.status(201).json({ ok: true, mission });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Champs invalides', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
