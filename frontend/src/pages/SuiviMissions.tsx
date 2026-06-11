import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type MissionRow = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  missionDate: string;
  startTime: string;
  endTime: string | null;
  truckType: string;
  hourlyRate: number;
  status: string;
  creator?: { companyProfile?: { companyName: string | null } } | null;
  driver?: { firstName: string | null; lastName: string | null } | null;
};

export default function SuiviMissions(): JSX.Element {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<{ open: number; assigned: number; past: number } | null>(null);
  const [missions, setMissions] = useState<{ open: MissionRow[]; assigned: MissionRow[]; past: MissionRow[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'open' | 'assigned' | 'past'>('open');
  const [statusFilter, setStatusFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

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
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const res = await fetch(`${apiBase}/admin/missions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
        if (!cancelled) {
          setCounts(data.counts ?? null);
          setMissions(data.missions ?? null);
        }
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token, navigate, statusFilter, from, to]);

  const list = missions?.[tab] ?? [];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Suivi des missions</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/admin/dashboard')}>Retour</button>
      </header>
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Suivi des missions</h1>

        <div className="flex flex-wrap items-center gap-2">
          {(['open', 'assigned', 'past'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t ? 'bg-gray-900 text-white' : 'border'}`}
              onClick={() => setTab(t)}
            >
              {t === 'open' ? 'Non pourvues' : t === 'assigned' ? 'À venir' : 'Passées'} ({counts?.[t] ?? 0})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous statuts</option>
            <option value="OUVERTE">Ouverte</option>
            <option value="POURVUE">Pourvue</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : list.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune mission.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Horaires</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Taux</th>
                  <th className="px-4 py-3">Lieu</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Chauffeur</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{m.title}</td>
                    <td className="px-4 py-3">{new Date(m.missionDate).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">{m.startTime}{m.endTime ? ` - ${m.endTime}` : ''}</td>
                    <td className="px-4 py-3">{m.truckType}</td>
                    <td className="px-4 py-3">{m.hourlyRate.toFixed(2)} €</td>
                    <td className="px-4 py-3">{m.location}</td>
                    <td className="px-4 py-3">{m.status}</td>
                    <td className="px-4 py-3">{m.driver ? `${m.driver.lastName ?? ''} ${m.driver.firstName ?? ''}` : '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-xs text-blue-700 hover:text-blue-800"
                        onClick={() => navigate(`/admin/missions/${m.id}`)}
                      >
                        Détail
                      </button>
                    </td>
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
