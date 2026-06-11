import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/requireAdmin';
import { validateCredentialsSchema, sendSmsSchema } from '../schemas/sms';
import { smsService } from '../services/sms/SmsService';

export function registerSmsRoutes(app: Application) {
  app.post('/api/sms/validate', requireAdmin, async (req: Request, res: Response) => {
    try {
      validateCredentialsSchema.parse(req.body);
      const result = await smsService.validateCredentials();
      return res.status(200).json({ ok: true, provider: result.provider });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/sms/send', requireAdmin, async (req: Request, res: Response) => {
    try {
      const body = sendSmsSchema.parse(req.body);
      const result = await smsService.send(body);

      await smsService.logSms({
        recipientPhone: body.to,
        message: body.body,
        provider: body.provider,
        status: result.ok ? 'SENT' : 'FAILED',
        providerRef: result.providerRef,
        error: result.error ?? undefined,
        sentAt: result.ok ? new Date() : undefined,
      });

      return res.status(200).json({ ok: result.ok, providerRef: result.providerRef, error: result.error });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/sms/logs', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const logs = await prisma.smsLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      return res.status(200).json({ ok: true, logs });
    } catch {
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
