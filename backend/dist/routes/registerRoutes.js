import { registerHealthRoutes } from './health';
import { registerInscriptionChauffeurRoutes } from './inscriptionChauffeurRoutes';
export function registerRoutes(app) {
    registerHealthRoutes(app);
    registerInscriptionChauffeurRoutes(app);
}
