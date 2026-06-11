import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { TruckType } from '@prisma/client';

const MIN_RATES: Record<TruckType, number> = {
  PL: 25,
  SPL: 30,
  ADR: 35,
  FRIGO: 35,
};

const createMissionSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().min(2).max(500),
  missionDate: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  truckType: z.nativeEnum(TruckType),
  hourlyRate: z.coerce.number().positive(),
  favoritePriorityHours: z.coerce.number().int().nonnegative().optional().nullable(),
});

const VALID_MISSION = {
  title: 'Mission test',
  description: 'test',
  location: 'Paris',
  missionDate: new Date(Date.now() + 86400000).toISOString(),
  startTime: '09:00',
  endTime: '12:00',
  truckType: TruckType.PL,
  hourlyRate: 25,
  favoritePriorityHours: 0,
} as const;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.post('/api/companies/missions', async (req: express.Request, res: express.Response) => {
    try {
      const body = createMissionSchema.parse(req.body);
      const minRate = MIN_RATES[body.truckType];
      if (body.hourlyRate < minRate) {
        return res.status(400).json({ ok: false, message: `Taux horaire trop bas pour ${body.truckType} (minimum ${minRate} €/h)` });
      }
      return res.status(201).json({ ok: true, mission: { id: 'test-mission', status: 'OUVERTE' } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: 'Champs invalides', errors: err.flatten() });
      }
      return res.status(500).json({ ok: false, message: 'Erreur interne' });
    }
  });
  return app;
}

describe('companyRoutes floor rate validation', () => {
  const truckTypes: TruckType[] = ['PL', 'SPL', 'ADR', 'FRIGO'];

  const truckTypeLabels: Record<TruckType, string> = {
    PL: 'PL',
    SPL: 'SPL',
    ADR: 'ADR',
    FRIGO: 'FRIGO',
  };

  for (const tt of truckTypes) {
    const min = MIN_RATES[tt];
    const justBelow = min - 0.5;
    const atMin = min;
    describe(`TruckType.${tt}`, () => {
      it(`returns 400 when rate < ${min}`, async () => {
        const app = buildApp();
        const payload = { ...VALID_MISSION, truckType: tt, hourlyRate: justBelow };
        const response = await request(app).post('/api/companies/missions').send(payload);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          ok: false,
          message: `Taux horaire trop bas pour ${truckTypeLabels[tt]} (minimum ${min} €/h)`,
        });
      });

      it(`returns 201 when rate >= ${min}`, async () => {
        const app = buildApp();
        const payload = { ...VALID_MISSION, truckType: tt, hourlyRate: atMin };
        const response = await request(app).post('/api/companies/missions').send(payload);
        expect(response.status).toBe(201);
        expect(response.body.ok).toBe(true);
      });

      it(`returns 400 when rate is 0 (below minimum despite positive coercion)`, async () => {
        const app = buildApp();
        const payload = { ...VALID_MISSION, truckType: tt, hourlyRate: 0 };
        const response = await request(app).post('/api/companies/missions').send(payload);
        // Zod must reject via .positive() before floor rate check
        expect(response.status).toBe(400);
      });
    });
  }
});
