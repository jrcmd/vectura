import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middleware/requireAdmin';
import { createIncident, listAuditEvents, listIncidents, updateIncident } from '../services/auditService';

const incidentSchema = z.object({
  title: z.string().min(1).max(200),
  severity: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  source: z.string().max(100).optional().nullable(),
  url: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
});

const incidentUpdateSchema = z.object({
  status: z.enum(['OPEN', 'DOING', 'RESOLVED', 'CLOSED']).optional(),
  description: z.string().max(2000).optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
});

export function registerAuditRoutes(app: Application) {
  app.get('/api/admin/audit/events', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = z.object({
        action: z.string().max(120).optional(),
        status: z.string().max(40).optional(),
        limit: z.coerce.number().int().positive().max(200).optional().default(50),
        offset: z.coerce.number().int().nonnegative().optional().default(0),
      }).parse(req.query);

      const events = await listAuditEvents({
        action: query.action,
        status: query.status,
        limit: query.limit,
        offset: query.offset,
      });

      return res.status(200).json({ ok: true, ...events });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/admin/audit/incidents', requireAdmin, async (req: Request, res: Response) => {
    try {
      const query = z.object({
        status: z.string().max(40).optional(),
        limit: z.coerce.number().int().positive().max(200).optional().default(50),
        offset: z.coerce.number().int().nonnegative().optional().default(0),
      }).parse(req.query);

      const incidents = await listIncidents({
        status: query.status,
        limit: query.limit,
        offset: query.offset,
      });

      return res.status(200).json({ ok: true, ...incidents });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/admin/audit/incidents', requireAdmin, async (req: Request, res: Response) => {
    try {
      const incident = await createIncident(incidentSchema.parse(req.body));
      return res.status(201).json({ ok: true, incident });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Incident invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.patch('/api/admin/audit/incidents/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const incident = await updateIncident(id, incidentUpdateSchema.parse(req.body));
      return res.status(200).json({ ok: true, incident });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Mise à jour invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
