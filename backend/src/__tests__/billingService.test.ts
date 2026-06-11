import {
  calculateMissionAmount,
  calculateMargin,
  calculateDriverAmount,
  getPlatformMarginPercent,
} from '../services/billingService';

describe('billingService', () => {
  describe('calculateMissionAmount', () => {
    it('returns hourlyRate when no endTime provided', () => {
      const result = calculateMissionAmount(30, '08:00');
      expect(result).toBe(30);
    });

    it('calculates amount for 8-hour mission at 30€/hour', () => {
      const result = calculateMissionAmount(30, '08:00', '16:00');
      expect(result).toBe(240);
    });

    it('calculates amount for partial day mission', () => {
      const result = calculateMissionAmount(25, '09:30', '12:30');
      expect(result).toBe(75);
    });

    it('handles missions crossing noon', () => {
      const result = calculateMissionAmount(35, '08:00', '14:00');
      expect(result).toBe(210); // 6 hours * 35 = 210
    });
  });

  describe('calculateMargin', () => {
    it('calculates 15% margin by default', () => {
      const result = calculateMargin(100, 15);
      expect(result).toBe(15);
    });

    it('calculates margin for various percentages', () => {
      expect(calculateMargin(200, 10)).toBe(20);
      expect(calculateMargin(500, 20)).toBe(100);
    });

    it('rounds to two decimal places', () => {
      const result = calculateMargin(99.99, 15);
      expect(result).toBeCloseTo(15, 1);
    });
  });

  describe('calculateDriverAmount', () => {
    it('subtracts margin from billed amount', () => {
      const result = calculateDriverAmount(100, 15);
      expect(result).toBe(85);
    });

    it('handles zero margin', () => {
      const result = calculateDriverAmount(100, 0);
      expect(result).toBe(100);
    });
  });

  describe('getPlatformMarginPercent', () => {
    const originalEnv = process.env.PLATFORM_MARGIN_PERCENT;

    afterEach(() => {
      if (originalEnv) {
        process.env.PLATFORM_MARGIN_PERCENT = originalEnv;
      } else {
        delete process.env.PLATFORM_MARGIN_PERCENT;
      }
    });

    it('returns 15 as default when env not set', () => {
      delete process.env.PLATFORM_MARGIN_PERCENT;
      expect(getPlatformMarginPercent()).toBe(15);
    });

    it('returns env value when set', () => {
      process.env.PLATFORM_MARGIN_PERCENT = '20';
      expect(getPlatformMarginPercent()).toBe(20);
    });

    it('returns 15 for invalid values', () => {
      process.env.PLATFORM_MARGIN_PERCENT = 'invalid';
      expect(getPlatformMarginPercent()).toBe(15);
    });
  });
});