import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, DocStatus } from '@prisma/client';
import { requireAdmin } from '../middleware/requireAdmin';

const prisma = new PrismaClient();

const validateSchema = z.object({ documentId: z.string().min(1) });
const rejectSchema = z.object({ documentId: z.string().min(1), reason: z.string().max(500).optional() });

export function registerAdminDocumentRoutes(app: Application) {
  app.get('/api/admin/drivers/:driverId/documents', requireAdmin, async (req: Request, res: Response) => {
    const { driverId } = req.params;

    const documents = await prisma.document.findMany({
      where: { userId: driverId },
      orderBy: { uploadedAt: 'asc' },
      select: {
        id: true,
        type: true,
        fileUrl: true,
        expiryDate: true,
        status: true,
        uploadedAt: true,
        validatedAt: true,
        validatedBy: true,
        rejectionReason: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: driverId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, city: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ ok: false, message: 'Chauffeur introuvable' });
    }

    return res.status(200).json({ ok: true, driver: user, documents });
  });

  app.patch('/api/admin/documents/validate', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { documentId } = validateSchema.parse(req.body);
      const adminId = (req as unknown as { adminId: string }).adminId;

      const doc = await prisma.document.update({
        where: { id: documentId },
        data: { status: DocStatus.VALIDE, validatedAt: new Date(), validatedBy: adminId, rejectionReason: null },
        select: { id: true, status: true, validatedAt: true, validatedBy: true },
      });

      return res.status(200).json({ ok: true, document: doc });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.patch('/api/admin/documents/reject', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { documentId, reason } = rejectSchema.parse(req.body);
      const adminId = (req as unknown as { adminId: string }).adminId;

      const doc = await prisma.document.update({
        where: { id: documentId },
        data: { status: DocStatus.REJETE, validatedAt: new Date(), validatedBy: adminId, rejectionReason: reason ?? null },
        select: { id: true, status: true, validatedAt: true, validatedBy: true, rejectionReason: true },
      });

      return res.status(200).json({ ok: true, document: doc });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
