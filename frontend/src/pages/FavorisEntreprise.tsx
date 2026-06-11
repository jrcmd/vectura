import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type FavoriteItem = {
  id: string;
  priorityHours: number;
  driver: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    city: string | null;
    driverProfile: { hasPermisC: boolean; hasPermisCE: boolean; hasADR: boolean; hasFrigo: boolean } | null;
  };
};

export default function FavorisEntreprise(): JSX.Element {
  const navigate = useNavigate();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  async function load() {
    if (!token) return navigate('/connexion-entreprise');
    setLoading(true);
    setError(null);
    try {
      const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
      const res = await fetch(`${apiBase}/companies/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setItems(data.favorites ?? []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token, navigate]);

  async function remove(driverId: string) {
    if (!token) return;
    const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
    await fetch(`${apiBase}/companies/favorites/${driverId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.filter((f) => f.driver.id !== driverId));
  }

  async function setPriority(driverId: string, hours: number) {
    if (!token) return;
    const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
    await fetch(`${apiBase}/companies/favorites/${driverId}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ priorityHours: hours }),
    });
    setItems((prev) => prev.map((f) => (f.driver.id === driverId ? { ...f, priorityHours: hours } : f)));
  }

  const filtered = items.filter((f) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    const name = `${f.driver.firstName ?? ''} ${f.driver.lastName ?? ''}`.toLowerCase();
    return name.includes(q) || (f.driver.city ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Favoris</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/espace/entreprise')}>
          Retour
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Chauffeurs favoris</h1>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Filtrer par nom ou ville"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : null}
        {error ? (<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>) : null}

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-600">Aucun favori.</p>
          ) : (
            filtered.map((fav) => (
              <div key={fav.id} className="rounded-xl border bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {fav.driver.firstName ?? ''} {fav.driver.lastName ?? ''} {fav.driver.email ? `(${fav.driver.email})` : ''}
                    </div>
                    <div className="text-xs text-slate-500">
                      Ville : {fav.driver.city ?? '-'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-700">Priorité (h)</label>
                    <input
                      type="number"
                      min={0}
                      className="w-20 rounded-lg border px-2 py-1 text-sm"
                      value={fav.priorityHours}
                      onChange={(e) => setPriority(fav.driver.id, Number(e.target.value))}
                    />
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-red-50"
                      onClick={() => remove(fav.driver.id)}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fav.driver.driverProfile?.hasPermisC ? <span className="rounded-full border px-2 py-0.5 text-xs">C</span> : null}
                  {fav.driver.driverProfile?.hasPermisCE ? <span className="rounded-full border px-2 py-0.5 text-xs">CE</span> : null}
                  {fav.driver.driverProfile?.hasADR ? <span className="rounded-full border px-2 py-0.5 text-xs">ADR</span> : null}
                  {fav.driver.driverProfile?.hasFrigo ? <span className="rounded-full border px-2 py-0.5 text-xs">FRIGO</span> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
