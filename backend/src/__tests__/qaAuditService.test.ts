import { buildFunctionalQaSummary, buildLaunchQaSummary, buildPreproductionQaSummary, buildProductionQaSummary, buildSecurityQaSummary, buildStabilizationQaSummary, canAccessRole, evaluateLateCancellation, validateUploadFile } from '../services/qaAuditService';

describe('qaAuditService', () => {
  describe('canAccessRole', () => {
    it('keeps roles isolated by hierarchy', () => {
      expect(canAccessRole('CHAUFFEUR', 'ENTREPRISE')).toBe(false);
      expect(canAccessRole('ENTREPRISE', 'ADMIN')).toBe(false);
      expect(canAccessRole('ADMIN', 'CHAUFFEUR')).toBe(true);
      expect(canAccessRole('ENTREPRISE', 'ENTREPRISE')).toBe(true);
    });
  });

  describe('evaluateLateCancellation', () => {
    it('does not sanction on-time cancellations', () => {
      expect(evaluateLateCancellation({ isLate: false, lateCount: 2, currentStatus: 'VALIDE' })).toMatchObject({
        sanctionType: 'NONE',
        status: 'VALIDE',
      });
    });

    it('suspends the first and second late cancellations', () => {
      expect(evaluateLateCancellation({ isLate: true, lateCount: 1, currentStatus: 'VALIDE' })).toMatchObject({
        sanctionType: 'SUSPENSION',
        status: 'SUSPENDU',
      });
      expect(evaluateLateCancellation({ isLate: true, lateCount: 2, currentStatus: 'SUSPENDU' })).toMatchObject({
        sanctionType: 'SUSPENSION',
        status: 'SUSPENDU',
      });
    });

    it('radiates the third late cancellation', () => {
      expect(evaluateLateCancellation({ isLate: true, lateCount: 3, currentStatus: 'SUSPENDU' })).toMatchObject({
        sanctionType: 'RADIATION',
        status: 'RADIE',
      });
    });
  });

  describe('validateUploadFile', () => {
    it('accepts supported document files under the limit', () => {
      expect(validateUploadFile({ filename: 'permis.pdf', sizeBytes: 1024, maxFileSizeMb: 10 }).ok).toBe(true);
    });

    it('rejects executable extensions and oversized files', () => {
      const result = validateUploadFile({ filename: 'shell.php', sizeBytes: 20 * 1024 * 1024, maxFileSizeMb: 10 });
      expect(result.ok).toBe(false);
      expect(result.reasons).toEqual(expect.arrayContaining(['Extension non autorisée', 'Fichier trop volumineux (10 Mo maximum)']));
    });
  });

  describe('qa summaries', () => {
    it('exposes functional and security QA endpoints', () => {
      expect(buildFunctionalQaSummary().matching).toContain('/api/driver/missions');
      expect(buildSecurityQaSummary().maliciousUpload).toContain('validateUploadFile');
    });

    it('exposes launch QA summaries', () => {
      const summary = buildLaunchQaSummary();
      expect(buildPreproductionQaSummary().seedData).toContain('/api/qa/seed');
      expect(buildProductionQaSummary().readiness).toContain('/api/admin/monitoring/production');
      expect(buildStabilizationQaSummary().auditTrail).toContain('/api/admin/audits');
      expect(Object.keys(summary)).toEqual(['functional', 'security', 'preproduction', 'production', 'stabilization']);
    });
  });
});
