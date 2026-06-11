import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuiviMissions(): JSX.Element {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<{ open: number; assigned: number; past: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  useEffect(() => {
    if (!token) return navigate('/connexion-entreprise');
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/admin/missions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
        if (!cancelled) setCounts(data.counts);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Suivi des missions</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/admin/dashboard')}>Retour</button>
      </header>
      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Suivi des missions</h1>
        {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : error ? (<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>) : counts ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-medium text-slate-500">Missions non pourvues</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{counts.open}</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-medium text-slate-500">Missions à venir</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{counts.assigned}</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-medium text-slate-500">Missions passées</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{counts.past}</p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
