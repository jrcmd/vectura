import type { NextFunction, Request, Response } from 'express';

export function errorHandler(error: Error, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error);
  }

  // eslint-disable-next-line no-console
  console.error(error);
  return res.status(500).json({ ok: false, message: 'Erreur interne' });
}
