import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/requireAdmin';
import { buildFunctionalQaSummary, buildLaunchQaSummary, buildPreproductionQaSummary, buildProductionQaSummary, buildSecurityQaSummary, buildStabilizationQaSummary, canAccessRole, evaluateLateCancellation, validateUploadFile } from '../services/qaAuditService';
import { seedQaData } from '../services/qaSeedService';

const permissionSchema = z.object({
  actorRole: z.enum(['CHAUFFEUR', 'ENTREPRISE', 'ADMIN']),
  requiredRole: z.enum(['CHAUFFEUR', 'ENTREPRISE', 'ADMIN']),
});

const uploadCheckSchema = z.object({
  filename: z.string().min(1).max(255),
  sizeBytes: z.coerce.number().nonnegative(),
  maxFileSizeMb: z.coerce.number().positive().optional(),
});

const lateCancellationSchema = z.object({
  isLate: z.boolean(),
  lateCount: z.coerce.number().int().nonnegative(),
  currentStatus: z.enum(['VALIDE', 'SUSPENDU', 'RADIE']).optional(),
});

const seedSchema = z.object({
  allowProduction: z.boolean().optional(),
});

const qaCheckSchema = z.object({
  suite: z.enum(['functional', 'security', 'preproduction', 'production', 'stabilization']),
  name: z.string().min(1).max(120),
  status: z.enum(['TODO', 'DOING', 'PASS', 'FAIL', 'BLOCKED']).optional(),
  notes: z.string().max(1000).optional().nullable(),
  owner: z.string().max(120).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export function registerQaRoutes(app: Application) {
  app.get('/api/qa/functional', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, flows: buildFunctionalQaSummary() });
  });

  app.get('/api/qa/security', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, controls: buildSecurityQaSummary() });
  });

  app.get('/api/qa/preprod', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, checks: buildPreproductionQaSummary() });
  });

  app.get('/api/qa/preproduction', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, checks: buildPreproductionQaSummary() });
  });

  app.get('/api/qa/production', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, checks: buildProductionQaSummary() });
  });

  app.get('/api/qa/stabilization', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, checks: buildStabilizationQaSummary() });
  });

  app.get('/api/qa/summary', requireAdmin, async (_req: Request, res: Response) => {
    return res.status(200).json({ ok: true, summary: buildLaunchQaSummary() });
  });

  app.post('/api/qa/permissions/check', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { actorRole, requiredRole } = permissionSchema.parse(req.body);
      return res.status(200).json({
        ok: true,
        allowed: canAccessRole(actorRole, requiredRole),
        actorRole,
        requiredRole,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/qa/uploads/check', requireAdmin, async (req: Request, res: Response) => {
    try {
      const payload = uploadCheckSchema.parse(req.body);
      const result = validateUploadFile(payload);
      return res.status(result.ok ? 200 : 400).json({ ok: result.ok, validation: result });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/qa/late-cancellation/check', requireAdmin, async (req: Request, res: Response) => {
    try {
      const payload = lateCancellationSchema.parse(req.body);
      return res.status(200).json({ ok: true, decision: evaluateLateCancellation(payload) });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/qa/seed', requireAdmin, async (req: Request, res: Response) => {
    try {
      const payload = seedSchema.parse(req.body ?? {});
      const previousProduction = process.env.NODE_ENV;
      if (payload.allowProduction) {
        process.env.NODE_ENV = 'staging';
      }

      const result = await seedQaData((req as unknown as { adminId: string }).adminId);

      if (payload.allowProduction) {
        process.env.NODE_ENV = previousProduction;
      }

      return res.status(200).json({ ok: true, seed: result });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: err instanceof Error ? err.message : 'Erreur interne' });
    }
  });

  app.post('/api/qa/checks', requireAdmin, async (req: Request, res: Response) => {
    try {
      const payload = qaCheckSchema.parse(req.body);
      const qaCheck = await prisma.qaCheck.upsert({
        where: { suite_name: { suite: payload.suite, name: payload.name } },
        update: {
          status: payload.status ?? 'TODO',
          notes: payload.notes,
          owner: payload.owner,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
        },
        create: {
          suite: payload.suite,
          name: payload.name,
          status: payload.status ?? 'TODO',
          notes: payload.notes,
          owner: payload.owner,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        },
      });
      return res.status(200).json({ ok: true, qaCheck });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.get('/api/qa/checks', requireAdmin, async (_req: Request, res: Response) => {
    const checks = await prisma.qaCheck.findMany({
      orderBy: [{ suite: 'asc' }, { name: 'asc' }],
    });
    return res.status(200).json({ ok: true, checks });
  });

  app.patch('/api/qa/checks/:suite/:name', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { suite, name } = req.params;
      const payload = qaCheckSchema.parse({ ...req.body, suite, name });
      const qaCheck = await prisma.qaCheck.update({
        where: { suite_name: { suite: payload.suite, name: payload.name } },
        data: {
          status: payload.status ?? 'TODO',
          notes: payload.notes,
          owner: payload.owner,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        },
      });
      return res.status(200).json({ ok: true, qaCheck });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Requête invalide', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
