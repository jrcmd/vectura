import type { Application, Request, Response } from 'express';
import { evaluateDriverQualification } from '../services/qualificationService';
import { requireDriver } from './authRoutes';

export function registerQualificationRoutes(app: Application) {
  app.get('/api/driver/qualification', requireDriver, async (req: Request, res: Response) => {
    const driverId = (req as unknown as { driverId: string }).driverId;

    const qualification = await evaluateDriverQualification(driverId);

    return res.status(200).json({ ok: true, qualification });
  });
}
