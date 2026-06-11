import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import path from 'path';
import multer from 'multer';

import { registerRoutes } from './routes/registerRoutes';
import { auditRequest } from './middleware/auditRequest';
import { errorHandler } from './middleware/errorHandler';
import type { NextFunction, Request, Response } from 'express';

dotenv.config();

export function createServer() {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
  app.use('/uploads', express.static(uploadDir, { fallthrough: true }));

  // Request logging
  app.use(
    pinoHttp({
      // Use env LOG_LEVEL if needed later
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );

  app.use(['/api/health', '/health'], (_req, res) => {
    res.json({ ok: true });
  });

  app.use(auditRequest);

  registerRoutes(app);

  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ ok: false, message: 'Fichier trop volumineux.' });
    }
    if (err.message.includes('Type de fichier non autorisé')) {
      return res.status(400).json({ ok: false, message: 'Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG.' });
    }
    next(err);
  });

  app.use(errorHandler);

  return app;
}
