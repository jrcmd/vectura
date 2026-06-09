import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { registerRoutes } from './routes/registerRoutes';

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

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  registerRoutes(app);

  return app;
}
