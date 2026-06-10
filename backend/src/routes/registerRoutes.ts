import type { Application } from 'express';
import { registerHealthRoutes } from './health';
import { registerInscriptionChauffeurRoutes } from './inscriptionChauffeurRoutes';

export function registerRoutes(app: Application) {
  registerHealthRoutes(app);
  registerInscriptionChauffeurRoutes(app);
}

