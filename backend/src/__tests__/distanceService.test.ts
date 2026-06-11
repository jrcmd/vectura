import { haversineDistanceKm, getMaxRadiusKm } from '../services/distanceService';

describe('distanceService', () => {
  it('calculates a known distance within expected bounds', () => {
    const distance = haversineDistanceKm(48.8566, 2.3522, 51.5074, -0.1278);
    expect(distance).toBeGreaterThan(330);
    expect(distance).toBeLessThan(350);
  });

  it('returns default max radius when env is not set', () => {
    expect(getMaxRadiusKm()).toBe(50);
  });
});
