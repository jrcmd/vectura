import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Sanction = {
  id: string;
  driverId: string;
  type: string;
  startDate: string;
  endDate: string | null;
  reason: string;
  missionId: string | null;
  createdAt: string;
  driver: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    status: string;
  };
};

export default function SanctionsPage(): JSX.Element {
  const navigate = useNavigate();
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  async function load() {
    if (!token) return navigate('/connexion-entreprise');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/admin/sanctions?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; sanctions?: Sanction[]; message?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setSanctions(data.sanctions ?? []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Gestion des sanctions</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/admin/dashboard')}>Retour</button>
      </header>
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Sanctions</h1>
        {loading ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : sanctions.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune sanction enregistrée.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Chauffeur</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Raison</th>
                  <th className="px-4 py-3">Statut chauffeur</th>
                  <th className="px-4 py-3">Mission</th>
                </tr>
              </thead>
              <tbody>
                {sanctions.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      {s.driver.lastName ?? ''} {s.driver.firstName ?? ''}
                      <span className="text-slate-500 ml-1">{s.driver.email}</span>
                    </td>
                    <td className="px-4 py-3">{s.type}</td>
                    <td className="px-4 py-3">{s.reason}</td>
                    <td className="px-4 py-3">{s.driver.status}</td>
                    <td className="px-4 py-3">{s.missionId ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
