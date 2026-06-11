import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireCompany } from '../middleware/requireCompany';

const prisma = new PrismaClient();

const addFavoriteSchema = z.object({ driverId: z.string().min(1) });
const updatePrioritySchema = z.object({ driverId: z.string().min(1), priorityHours: z.coerce.number().int().nonnegative() });

export function registerFavoriteRoutes(app: Application) {
  app.get('/api/companies/favorites', requireCompany, async (req: Request, res: Response) => {
    const companyId = (req as unknown as { companyId: string }).companyId;

    const favorites = await prisma.favorite.findMany({
      where: { companyId },
      include: {
        driver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            city: true,
            driverProfile: { select: { hasPermisC: true, hasPermisCE: true, hasADR: true, hasFrigo: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ ok: true, favorites });
  });

  app.post('/api/companies/favorites', requireCompany, async (req: Request, res: Response) => {
    try {
      const { driverId } = addFavoriteSchema.parse(req.body);
      const companyId = (req as unknown as { companyId: string }).companyId;

      const fav = await prisma.favorite.upsert({
        where: { companyId_driverId: { companyId, driverId } },
        update: {},
        create: { companyId, driverId, priorityHours: 0 },
      });

      return res.status(201).json({ ok: true, favorite: fav });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.delete('/api/companies/favorites/:driverId', requireCompany, async (req: Request, res: Response) => {
    const companyId = (req as unknown as { companyId: string }).companyId;
    const { driverId } = req.params;

    await prisma.favorite.deleteMany({ where: { companyId, driverId } });
    return res.status(200).json({ ok: true });
  });

  app.patch('/api/companies/favorites/:driverId/priority', requireCompany, async (req: Request, res: Response) => {
    try {
      const { driverId } = req.params;
      const { priorityHours } = updatePrioritySchema.parse({ driverId, priorityHours: req.body?.priorityHours });
      const companyId = (req as unknown as { companyId: string }).companyId;

      const fav = await prisma.favorite.updateMany({
        where: { companyId, driverId },
        data: { priorityHours },
      });

      if (fav.count === 0) {
        return res.status(404).json({ ok: false, message: 'Favori introuvable' });
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
