import type { Application, Request, Response } from 'express';
import { requireCompany } from '../middleware/requireCompany';
import { cancelMissionByCompany, completeMission, getMissionWithRelations } from '../services/missionService';

export function registerCompanyMissionRoutes(app: Application) {
  app.patch('/api/companies/missions/:id/complete', requireCompany, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = (req as unknown as { companyId: string }).companyId;

      const mission = await getMissionWithRelations(id);
      if (!mission) {
        return res.status(404).json({ ok: false, message: 'Mission introuvable' });
      }
      if (mission.creatorId !== companyId) {
        return res.status(403).json({ ok: false, message: 'Non autorisé' });
      }

      const updated = await completeMission(id, companyId);
      return res.status(200).json({ ok: true, mission: updated });
    } catch (err) {
      if (err instanceof Error && err.message === 'MISSION_NOT_FOUND') {
        return res.status(404).json({ ok: false, message: 'Mission introuvable' });
      }
      if (err instanceof Error && err.message === 'MISSION_NOT_IN_PROGRESS') {
        return res.status(400).json({ ok: false, message: 'Mission non en cours' });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });

  app.post('/api/companies/missions/:id/cancel', requireCompany, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const companyId = (req as unknown as { companyId: string }).companyId;

      const mission = await getMissionWithRelations(id);
      if (!mission) {
        return res.status(404).json({ ok: false, message: 'Mission introuvable' });
      }
      if (mission.creatorId !== companyId) {
        return res.status(403).json({ ok: false, message: 'Non autorisé' });
      }

      const updated = await cancelMissionByCompany(id, companyId);
      return res.status(200).json({ ok: true, mission: updated });
    } catch (err) {
      if (err instanceof Error && err.message === 'MISSION_NOT_FOUND') {
        return res.status(404).json({ ok: false, message: 'Mission introuvable' });
      }
      if (err instanceof Error && err.message === 'CANCEL_NOT_ALLOWED') {
        return res.status(400).json({ ok: false, message: 'Annulation impossible' });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
}
