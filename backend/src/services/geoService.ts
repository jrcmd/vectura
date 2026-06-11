export async function geocodeAddress(address: string): Promise<{ latitude: number | null; longitude: number | null }> {
  // MOCK: retourne null pour l’instant (intégration service externe à prévoir)
  void address;
  return { latitude: null, longitude: null };
}
