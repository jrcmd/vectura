import type { Application } from 'express';
import { registerHealthRoutes } from './health';

export function registerRoutes(app: Application) {
  registerHealthRoutes(app);
}
