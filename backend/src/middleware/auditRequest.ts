import type { NextFunction, Request, Response } from 'express';
import { createAuditEvent } from '../services/auditService';

export function auditRequest(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    if (res.statusCode < 400) return;

    createAuditEvent({
      action: `${req.method} ${req.path}`,
      resourceType: req.path.split('/')[1] ?? null,
      resourceId: req.params?.id ?? null,
      ip: req.ip,
      userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']) : null,
      status: res.statusCode >= 500 ? 'error' : 'warning',
      message: res.statusMessage || null,
    }).catch((error: Error) => {
      // eslint-disable-next-line no-console
      console.error('[AUDIT] failed to persist request audit event', error);
    });
  });

  next();
}
