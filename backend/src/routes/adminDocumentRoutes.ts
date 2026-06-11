import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { DocStatus } from '@prisma/client';
import { requireAdmin } from '../middleware/requireAdmin';
import { sendMail } from '../services/mailService';



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
        select: { id: true, status: true, validatedAt: true, validatedBy: true, userId: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: doc.userId },
        select: { id: true, email: true, firstName: true },
      });

      if (user?.email) {
        try {
          await sendMail({
            to: user.email,
            subject: 'Document validé',
            text: `Bonjour ${user.firstName ?? ''}, votre document a été validé.`,
          });
        } catch (mailErr) {
          console.error('[DOC] validation mail failed', user.id, mailErr);
        }
      }

      await prisma.notificationLog.create({
        data: {
          type: 'DOC_VALIDATED',
          recipientId: doc.userId,
          email: user?.email ?? 'unknown',
          subject: 'Document validé',
          status: 'sent',
        },
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
        select: { id: true, status: true, validatedAt: true, validatedBy: true, rejectionReason: true, userId: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: doc.userId },
        select: { id: true, email: true, firstName: true },
      });

      if (user?.email) {
        try {
          await sendMail({
            to: user.email,
            subject: 'Document rejeté',
            text: `Bonjour ${user.firstName ?? ''}, votre document a été rejeté${reason ? ` : ${reason}` : ''}.`,
          });
        } catch (mailErr) {
          console.error('[DOC] rejection mail failed', user.id, mailErr);
        }
      }

      await prisma.notificationLog.create({
        data: {
          type: 'DOC_REJECTED',
          recipientId: doc.userId,
          email: user?.email ?? 'unknown',
          subject: 'Document rejeté',
          status: 'sent',
          error: reason ?? null,
        },
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
