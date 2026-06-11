import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type DriverRow = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  status: string;
  createdAt: string;
  driverProfile: {
    hasPermisC: boolean;
    hasPermisCE: boolean;
    hasADR: boolean;
    hasFrigo: boolean;
    qualificationsValid: boolean;
  } | null;
};

export default function GestionChauffeurs(): JSX.Element {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  useEffect(() => {
    if (!token) return navigate('/connexion-entreprise');
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);
        if (search.trim()) params.set('q', search.trim());
        const res = await fetch(`${apiBase}/admin/drivers?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
        if (!cancelled) setDrivers((data.drivers as DriverRow[]) ?? []);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token, navigate, statusFilter, search, apiBase]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Gestion des chauffeurs</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/admin/dashboard')}>Retour</button>
      </header>
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Chauffeurs</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Rechercher par nom ou téléphone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="VALIDE">Validé</option>
            <option value="SUSPENDU">Suspendu</option>
            <option value="RADIE">Radié</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-4 py-3">Nom / Prénom</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3">Ville</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Qualifications</th>
                  <th className="px-4 py-3">Inscription</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-slate-600" colSpan={7}>
                      Aucun chauffeur.
                    </td>
                  </tr>
                ) : (
                  drivers.map((d) => (
                    <tr key={d.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {d.lastName ?? ''} {d.firstName ?? ''}
                      </td>
                      <td className="px-4 py-3">{d.phone ?? '-'}</td>
                      <td className="px-4 py-3">{d.city ?? '-'}</td>
                      <td className="px-4 py-3">{d.status}</td>
                      <td className="px-4 py-3">
                        {d.driverProfile ? (
                          <span className="flex flex-wrap gap-1">
                            {d.driverProfile.hasPermisC ? (
                              <span className="rounded-full border px-2 py-0.5 text-xs">C</span>
                            ) : null}
                            {d.driverProfile.hasPermisCE ? (
                              <span className="rounded-full border px-2 py-0.5 text-xs">CE</span>
                            ) : null}
                            {d.driverProfile.hasADR ? (
                              <span className="rounded-full border px-2 py-0.5 text-xs">ADR</span>
                            ) : null}
                            {d.driverProfile.hasFrigo ? (
                              <span className="rounded-full border px-2 py-0.5 text-xs">FRIGO</span>
                            ) : null}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-xs text-blue-700 hover:text-blue-800"
                          onClick={() => navigate(`/admin/chauffeurs/${d.id}/documents`)}
                        >
                          Documents
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
