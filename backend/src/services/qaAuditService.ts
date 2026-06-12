import path from 'path';

export type RoleName = 'ADMIN' | 'ENTREPRISE' | 'CHAUFFEUR';

export type LateCancellationDecision = {
  isLate: boolean;
  lateCount: number;
  status: 'VALIDE' | 'SUSPENDU' | 'RADIE';
  sanctionType: 'NONE' | 'SUSPENSION' | 'RADIATION';
  message: string;
};

export type UploadValidationResult = {
  ok: boolean;
  extension: string;
  maxBytes: number;
  reasons: string[];
};

const ROLE_LEVEL: Record<RoleName, number> = {
  CHAUFFEUR: 1,
  ENTREPRISE: 2,
  ADMIN: 3,
};

const ALLOWED_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const DEFAULT_MAX_FILE_SIZE_MB = 10;

export function canAccessRole(actorRole: RoleName, requiredRole: RoleName): boolean {
  return ROLE_LEVEL[actorRole] >= ROLE_LEVEL[requiredRole];
}

/**
 * Évaluation des décisions en cas d'annulation tardive.
 * - 1ère/2ème annulation : suspension temporaire
 * - 3ème annulation : radiation automatique
 */
export function evaluateLateCancellation(input: {
  isLate: boolean;
  lateCount: number;
  currentStatus?: 'VALIDE' | 'SUSPENDU' | 'RADIE';
}): LateCancellationDecision {
  const lateCount = Math.max(0, input.lateCount);

  if (!input.isLate) {
    return {
      isLate: false,
      lateCount,
      status: input.currentStatus ?? 'VALIDE',
      sanctionType: 'NONE',
      message: 'Annulation dans les délais.',
    };
  }

  if (lateCount >= 3) {
    return {
      isLate: true,
      lateCount,
      status: 'RADIE',
      sanctionType: 'RADIATION',
      message: 'Troisième annulation tardive : radiation automatique.',
    };
  }

  return {
    isLate: true,
    lateCount,
    status: 'SUSPENDU',
    sanctionType: 'SUSPENSION',
    message: 'Annulation tardive : suspension temporaire.',
  };
}

export function validateUploadFile(input: {
  filename: string;
  sizeBytes: number;
  maxFileSizeMb?: number;
}): UploadValidationResult {
  const maxFileSizeMb = input.maxFileSizeMb ?? Number(process.env.MAX_FILE_SIZE_MB ?? DEFAULT_MAX_FILE_SIZE_MB);
  const maxBytes = maxFileSizeMb * 1024 * 1024;
  const extension = path.extname(input.filename).toLowerCase();
  const reasons: string[] = [];

  if (!ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
    reasons.push('Extension non autorisée');
  }

  if (input.sizeBytes <= 0) {
    reasons.push('Fichier vide');
  }

  if (input.sizeBytes > maxBytes) {
    reasons.push(`Fichier trop volumineux (${maxFileSizeMb} Mo maximum)`);
  }

  return {
    ok: reasons.length === 0,
    extension,
    maxBytes,
    reasons,
  };
}

export function buildFunctionalQaSummary() {
  return {
    driverRegistration: 'POST /api/drivers/register',
    companyRegistration: 'POST /api/companies/register',
    loginLogout: 'POST /api/auth/login, POST /api/auth/logout, POST /api/companies/login, POST /api/companies/logout',
    documentUpload: 'POST /api/documents/upload',
    adminValidation: 'GET /api/admin/drivers/:driverId/documents, PATCH /api/admin/documents/validate, PATCH /api/admin/documents/reject',
    missionCreation: 'POST /api/companies/missions',
    matching: 'GET /api/driver/missions?type=available',
  };
}

export function buildSecurityQaSummary() {
  return {
    lateCancellation: 'evaluateLateCancellation() + POST /api/driver/missions/:id/cancel',
    billing: 'calculateMissionAmount(), calculateMargin(), calculateDriverAmount() + POST /api/companies/billing/invoices/generate',
    exports: 'GET /api/billing/invoices/:id/csv, GET /api/billing/invoices/:id/excel, GET /api/admin/billing/export/csv',
    unauthorizedAccess: 'requireDriver(), requireCompany(), requireAdmin()',
    rolesPermissions: 'canAccessRole()',
    maliciousUpload: 'validateUploadFile() + multer limits',
    apiErrors: 'pino-http + auditRequest + route error handlers',
  };
}

export function buildPreproductionQaSummary() {
  return {
    stagingCompose: 'docker-compose.staging.yml + .env.staging.example',
    seedData: 'POST /api/qa/seed',
    mail: 'GET /api/admin/monitoring/mail',
    cronJobs: 'GET /api/admin/monitoring/jobs',
    backups: 'POST /api/admin/monitoring/backups/run',
    incidentTracking: 'GET /api/admin/incidents, POST /api/admin/incidents',
  };
}

export function buildProductionQaSummary() {
  return {
    migrations: 'prisma migrate deploy',
    productionCompose: 'docker-compose.prod.yml + .env.production.example',
    readiness: 'GET /api/admin/monitoring/production',
    health: 'GET /api/monitoring/health',
    sslDomain: 'HTTPS + domain redirection manual validation',
    availability: 'Public user journey validation',
  };
}

export function buildStabilizationQaSummary() {
  return {
    incidents: 'GET /api/admin/incidents, PATCH /api/admin/incidents/:id/resolve',
    backups: 'GET /api/admin/monitoring/backups, POST /api/admin/monitoring/backups/run',
    cronRuns: 'GET /api/admin/monitoring/jobs, POST /api/admin/monitoring/jobs/:name/run',
    auditTrail: 'GET /api/admin/audits',
    qaChecks: 'GET /api/qa/checks, PATCH /api/qa/checks/:suite/:name',
  };
}

export function buildLaunchQaSummary() {
  return {
    functional: buildFunctionalQaSummary(),
    security: buildSecurityQaSummary(),
    preproduction: buildPreproductionQaSummary(),
    production: buildProductionQaSummary(),
    stabilization: buildStabilizationQaSummary(),
  };
}
