import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/requireAdmin';

const prisma = new PrismaClient();

const driverQuerySchema = z.object({
  status: z.enum(['EN_ATTENTE', 'VALIDE', 'SUSPENDU', 'RADIE']).optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export function registerAdminDriverRoutes(app: Application) {
  app.get('/api/admin/drivers', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = driverQuerySchema.parse(req.query);
      const where: Record<string, unknown> = { role: 'CHAUFFEUR' };

      if (query.status) {
        where.status = query.status;
      }
      if (query.q) {
        const q = query.q.toLowerCase();
        where.OR = [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ];
      }

      const skip = (query.page - 1) * query.limit;
      const [drivers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: query.limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            status: true,
            createdAt: true,
            driverProfile: { select: { hasPermisC: true, hasPermisCE: true, hasADR: true, hasFrigo: true, qualificationsValid: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({ ok: true, drivers, total, page: query.page, limit: query.limit });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
