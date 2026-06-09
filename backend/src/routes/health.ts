import type { Application, Request, Response } from 'express';

export function registerHealthRoutes(app: Application) {
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });
}
