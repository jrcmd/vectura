import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middleware/requireAdmin';
import { runPostgresBackup } from '../services/backupService';
import { getBackupSummary, getMailHealth, getMonitoringSnapshot, listCronJobs, listCronJobsFiltered, recordCronRun, updateCronJobEnabled } from '../services/monitoringService';
import { getProductionReadiness } from '../services/deploymentService';
import { sendMail } from '../services/mailService';

export function registerMonitoringRoutes(app: Application) {
  app.get('/api/monitoring/health', async (_req: Request, res: Response) => {
    try {
      const snapshot = await getMonitoringSnapshot();
      return res.status(snapshot.ok ? 200 : 503).json(snapshot);
    } catch (err) {
      return res.status(503).json({ ok: false, error: err instanceof Error ? err.message : 'Health check failed' });
    }
  });

  app.get('/api/admin/monitoring/production', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, readiness: getProductionReadiness() });
  });

  app.get('/api/admin/monitoring/jobs', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = z.object({
        enabled: z.enum(['true', 'false']).optional(),
      }).parse(req.query);
      const jobs = query.enabled ? await listCronJobsFiltered({ enabled: query.enabled === 'true' }) : await listCronJobs();
      return res.status(200).json({ ok: true, jobs });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.patch('/api/admin/monitoring/jobs/:name', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const { enabled } = z.object({ enabled: z.boolean() }).parse(req.body);
      const job = await updateCronJobEnabled(name, enabled);
      return res.status(200).json({ ok: true, job });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/admin/monitoring/jobs/:name/run', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const started = Date.now();
      const result = await recordCronRun({ name, status: 'SUCCESS', durationMs: Date.now() - started, error: null, nextRunAt: null });
      return res.status(200).json({ ok: true, job: result });
    } catch (err) {
      return res.status(500).json({ ok: false, message: err instanceof Error ? err.message : 'Erreur interne' });
    }
  });

  app.get('/api/admin/monitoring/backups', requireAdmin, async (_req: Request, res: Response) => {
    const backups = await getBackupSummary();
    return res.status(200).json({ ok: true, backups });
  });

  app.post('/api/admin/monitoring/backups/run', requireAdmin, async (_req: Request, res: Response) => {
    const result = await runPostgresBackup(process.env.NODE_ENV ?? 'development');
    return res.status(result.ok ? 200 : 500).json(result);
  });

  app.get('/api/admin/monitoring/mail', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, mail: getMailHealth() });
  });

  // Endpoint pour visualiser les échecs de notification
  app.get('/api/admin/monitoring/notifications/failed', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { getFailedNotifications } = await import('../services/mailService');
      const failed = await getFailedNotifications();
      return res.status(200).json({ ok: true, notifications: failed });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  // Endpoint pour retry manuel d'une notification
  app.post('/api/admin/monitoring/notifications/:id/retry', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { recordRetryAttempt, getRetryDelaySeconds } = await import('../services/mailService');
      const prisma = (await import('../lib/prisma')).default;

      const notification = await prisma.notificationLog.findUnique({ where: { id } });

      if (!notification) {
        return res.status(404).json({ ok: false, message: 'Notification introuvable' });
      }

      // Envoi avec retry en utilisant le body stocké
      const result = await sendMail({ to: notification.email, subject: notification.subject, text: notification.body ?? '' });

      await recordRetryAttempt(id, result.success, result.error);

      return res.status(200).json({
        ok: true,
        retried: true,
        success: result.success,
        nextRetrySeconds: result.success ? null : getRetryDelaySeconds(notification.retryCount ?? 0),
      });
    } catch (err) {
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
