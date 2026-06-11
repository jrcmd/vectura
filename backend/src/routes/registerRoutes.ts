import type { Application } from 'express';
import { registerHealthRoutes } from './health';
import { registerInscriptionChauffeurRoutes } from './inscriptionChauffeurRoutes';
import { registerAuthRoutes } from './authRoutes';
import { registerDocumentsRoutes } from './documentsRoutes';
import { registerPasswordResetRoutes } from './passwordResetRoutes';
import { registerDriverRoutes } from './driverRoutes';
import { registerCompanyAuthRoutes } from './companyAuthRoutes';
import { registerCompanyRoutes } from './companyRoutes';
import { registerFavoriteRoutes } from './favoriteRoutes';
import { registerQualificationRoutes } from './qualificationRoutes';
import { registerCompanyMissionRoutes } from './companyMissionRoutes';
import { registerBillingRoutes } from './billingRoutes';
import { registerCompanyBillingRoutes } from './companyBillingRoutes';
import { registerAdminRoutes } from './adminRoutes';
import { registerAdminDriverRoutes } from './adminDriverRoutes';
import { registerAdminDocumentRoutes } from './adminDocumentRoutes';
import { registerAdminMissionRoutes } from './adminMissionRoutes';
import { registerAdminBillingRoutes } from './adminBillingRoutes';

export function registerRoutes(app: Application) {
  registerHealthRoutes(app);
  registerInscriptionChauffeurRoutes(app);
  registerAuthRoutes(app);
  registerDocumentsRoutes(app);
  registerPasswordResetRoutes(app);
  registerDriverRoutes(app);
  registerCompanyAuthRoutes(app);
  registerCompanyRoutes(app);
  registerFavoriteRoutes(app);
  registerQualificationRoutes(app);
  registerCompanyMissionRoutes(app);
  registerBillingRoutes(app);
  registerCompanyBillingRoutes(app);
  registerAdminRoutes(app);
  registerAdminDriverRoutes(app);
  registerAdminDocumentRoutes(app);
  registerAdminMissionRoutes(app);
  registerAdminBillingRoutes(app);
}

